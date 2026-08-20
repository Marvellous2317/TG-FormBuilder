import { Op } from "sequelize";
import ExcelJS from "exceljs";
import {
  SubmittedChecklist,
  SubmittedChecklistEntry,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { cleanText, presentationFor, sectionHeading, summaryHeading, titleCase } from "./presentation.js";

const DEFAULT_SUBMISSION_LIMIT = 100;
const MAX_SUBMISSION_LIMIT = 500;

const INK = "FF1F2933";
const VALUE_INK = "FF0F766E";
const TITLE_FONT = { bold: true, size: 14, color: { argb: INK } };
const HEADING_FONT = { bold: true, size: 12, color: { argb: INK } };
const LABEL_FONT = { size: 11, color: { argb: INK } };
const HEADER_FONT = { bold: true, size: 11, color: { argb: INK } };
const VALUE_FONT = { size: 11, color: { argb: VALUE_INK } };
const LEFT = { horizontal: "left", vertical: "middle" };

const NUMERIC_FIELD_TYPES = new Set(["number", "formular"]);


function rangeStart(value) {
  return new Date(value);
}

function rangeEnd(value) {
  const date = new Date(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date;
}


function sectionRows(entry) {
  const raw = entry?.value;
  if (raw === null || raw === undefined || raw === "") return [];

  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  const list = Array.isArray(parsed) ? parsed : [parsed];
  return list
    .map((row) => {
      const cells = {};
      if (row && typeof row === "object") {
        for (const [fieldId, cell] of Object.entries(row)) {
          cells[fieldId] = cell && typeof cell === "object" && "value" in cell ? cell.value : cell;
        }
      }
      return cells;
    })
    .filter((cells) => Object.values(cells).some((v) => v !== null && v !== undefined && String(v).trim() !== ""));
}


function visibleFields(entry) {
  const items = entry?.config?.items;
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item?.config?.visible !== false);
}


function recordDate(entries) {
  for (const entry of entries) {
    if (entry.type === "section") {
      const dateField = visibleFields(entry).find((field) => field.type === "date");
      if (!dateField) continue;
      for (const cells of sectionRows(entry)) {
        const raw = cleanText(cells[dateField.id]);
        if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
      }
      continue;
    }
    if (entry.type === "date") {
      const raw = cleanText(entry.value);
      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
    }
  }
  return null;
}

function formatValue(value, fieldType) {
  const text = cleanText(value);
  if (!text) return "";

  if (fieldType === "date") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  }

  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
}


function layoutFor(fields, maxRows) {
  if (fields.length && fields.every((field) => field.type === "enum")) return "checks";
  if (maxRows <= 1 && !fields.some((field) => NUMERIC_FIELD_TYPES.has(field.type))) return "pairs";
  return "table";
}

class SheetWriter {
  constructor(sheet) {
    this.sheet = sheet;
    this.maxColumns = 2;
  }

  blank() {
    this.sheet.addRow([]);
  }

  title(text) {
    const row = this.sheet.addRow([text]);
    row.getCell(1).font = TITLE_FONT;
    row.getCell(1).alignment = LEFT;
    row.height = 22;
  }

  heading(text) {
    const row = this.sheet.addRow([text]);
    row.getCell(1).font = HEADING_FONT;
    row.getCell(1).alignment = LEFT;
  }

  pair(label, value) {
    const row = this.sheet.addRow([label, value]);
    row.getCell(1).font = LABEL_FONT;
    row.getCell(1).alignment = LEFT;
    row.getCell(2).font = VALUE_FONT;
    row.getCell(2).alignment = LEFT;
  }

  table(headers, rows) {
    const headerRow = this.sheet.addRow(headers);
    headers.forEach((_, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.font = HEADER_FONT;
      cell.alignment = LEFT;
    });

    for (const values of rows) {
      const row = this.sheet.addRow(values);
      headers.forEach((_, index) => {
        const cell = row.getCell(index + 1);
        cell.font = VALUE_FONT;
        cell.alignment = LEFT;
      });
    }

    this.maxColumns = Math.max(this.maxColumns, headers.length);
  }
}

// Returns false when the section held nothing, so the caller can skip its spacer.
function writeSection(writer, presentation, entry, layout) {
  const fields = visibleFields(entry);
  const rows = sectionRows(entry);

  // A section the operator never filled in would otherwise print as a heading
  // over a column header with no data, or a column of blank labels.
  if (!rows.length) return false;

  writer.heading(presentation.heading(sectionHeading(entry)));

  if (!fields.length) {
    for (const cells of rows) {
      for (const [fieldId, value] of Object.entries(cells)) {
        writer.pair(presentation.label({ id: fieldId, name: fieldId }), formatValue(value));
      }
    }
    return true;
  }

  if (layout === "checks") {
    writer.table(
      ["Check", "Result"],
      rows.flatMap((cells) =>
        fields.map((field) => [presentation.label(field), formatValue(cells[field.id], field.type)]),
      ),
    );
    return true;
  }

  if (layout === "pairs") {
    const cells = rows[0] || {};
    for (const field of fields) {
      writer.pair(presentation.label(field), formatValue(cells[field.id], field.type));
    }
    return true;
  }

  writer.table(
    fields.map((field) => presentation.label(field)),
    rows.map((cells) => fields.map((field) => formatValue(cells[field.id], field.type))),
  );
  return true;
}

function writeSubmission(writer, presentation, submission, entries, layouts, index) {
  writer.title(`${presentation.documentTitle(submission.title)} — SUBMISSION ${index + 1}`);
  writer.blank();

  writer.heading("Submission Information");
  writer.pair("Document Number", cleanText(submission.documentNumber));
  writer.pair("Status", titleCase(submission.status));
  writer.blank();

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];

    if (entry.type === "section") {
      if (writeSection(writer, presentation, entry, layouts.get(entry.entryId) || "table")) {
        writer.blank();
      }
      continue;
    }

    if (entry.type === "section_formular") {
      const group = [entry];
      while (
        i + 1 < entries.length &&
        entries[i + 1].type === "section_formular" &&
        cleanText(entries[i + 1].config?.name) === cleanText(entry.config?.name)
      ) {
        i += 1;
        group.push(entries[i]);
      }
      writer.heading(presentation.heading(summaryHeading(entry)));
      for (const item of group) {
        writer.pair(presentation.label(item), formatValue(item.value, "number"));
      }
      writer.blank();
      continue;
    }

    // A standalone entry carries one name, so heading + label repeat it ("NB"
    // over "NB | SKU 2"). Only print the heading when a label override renamed
    // the value row to something different.
    const heading = presentation.heading(titleCase(entry.name));
    const label = presentation.label(entry);
    if (label !== heading) writer.heading(heading);
    writer.pair(label, formatValue(entry.value, entry.type));
    writer.blank();
  }
}

export class ExportRepository {
  static async exportSubmittedChecklists(documentNumber, companyId, { startDate, endDate, status, limit } = {}) {
    try {
      if (!documentNumber) throw new ApplicationError("documentNumber is required", 400);

      let submissionLimit = limit !== undefined ? Number(limit) : DEFAULT_SUBMISSION_LIMIT;
      if (!Number.isFinite(submissionLimit) || submissionLimit < 1) submissionLimit = DEFAULT_SUBMISSION_LIMIT;
      if (submissionLimit > MAX_SUBMISSION_LIMIT) submissionLimit = MAX_SUBMISSION_LIMIT;


      const submissionWhere = { companyId, documentNumber };
      if (status) submissionWhere.status = status;
      if (startDate || endDate) {
        submissionWhere.createdAt = {};
        if (startDate) submissionWhere.createdAt[Op.gte] = rangeStart(startDate);
        if (endDate) submissionWhere.createdAt[Op.lte] = rangeEnd(endDate);
      }


      const submissions = (
        await SubmittedChecklist.findAll({
          where: submissionWhere,
          attributes: [
            "submittedChecklistId", "documentNumber", "title", "issuedNumber",
            "entityDisplayName", "status", "submittedAt", "createdAt",
          ],
          order: [["submittedAt", "DESC"], ["createdAt", "DESC"]],
          limit: submissionLimit,
        })
      ).reverse();

   
      if (!submissions.length) {
        throw new ApplicationError(
          startDate || endDate
            ? "No submissions found for this document number in the selected date range."
            : "No submissions found for this document number.",
          404,
        );
      }

      const submissionIds = submissions.map((s) => s.submittedChecklistId);
      const entryRows = submissionIds.length
        ? await SubmittedChecklistEntry.findAll({
            where: { submittedChecklistId: { [Op.in]: submissionIds } },
            attributes: [
              "submittedChecklistId", "entryId", "name", "value",
              "type", "section", "status", "order", "config",
            ],
            order: [["order", "ASC"]],
          })
        : [];

      const entriesBySubmission = new Map(submissionIds.map((id) => [id, []]));
      for (const entry of entryRows) {
        entriesBySubmission.get(entry.submittedChecklistId)?.push(entry);
      }


      const rowCounts = new Map();
      const sectionFields = new Map();
      for (const entry of entryRows) {
        if (entry.type !== "section") continue;
        const previous = rowCounts.get(entry.entryId) || 0;
        rowCounts.set(entry.entryId, Math.max(previous, sectionRows(entry).length));
        const fields = visibleFields(entry);
        if (fields.length > (sectionFields.get(entry.entryId)?.length || 0)) {
          sectionFields.set(entry.entryId, fields);
        }
      }
      const layouts = new Map();
      for (const [entryId, fields] of sectionFields) {
        layouts.set(entryId, layoutFor(fields, rowCounts.get(entryId) || 0));
      }

      const submittedTime = (submission) =>
        new Date(submission.submittedAt || submission.createdAt).getTime() || 0;
      const ordered = submissions
        .map((submission) => {
          const entries = entriesBySubmission.get(submission.submittedChecklistId) || [];
          const logged = recordDate(entries);
          return {
            submission,
            entries,
            loggedAt: logged ? new Date(`${logged}T00:00:00Z`).getTime() : submittedTime(submission),
          };
        })
        .sort((a, b) => a.loggedAt - b.loggedAt || submittedTime(a.submission) - submittedTime(b.submission));

      const presentation = presentationFor(documentNumber);
      const workbook = new ExcelJS.Workbook();
      const sheetTitle = cleanText(submissions[0]?.title) || "Submissions";
      const sheet = workbook.addWorksheet(sheetTitle.replace(/[\\/*?:[\]]/g, " ").slice(0, 31));
      const writer = new SheetWriter(sheet);

      ordered.forEach(({ submission, entries }, index) => {
        if (index > 0) writer.blank();
        writeSubmission(writer, presentation, submission, entries, layouts, index);
      });

      sheet.getColumn(1).width = 46;
      sheet.getColumn(2).width = 30;
      for (let column = 3; column <= Math.max(writer.maxColumns, 3); column += 1) {
        sheet.getColumn(column).width = 22;
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const safeName = String(documentNumber).replace(/[^a-z0-9_-]+/gi, "_").slice(0, 60) || "submissions";
      const filename = `${safeName}_submissions.xlsx`;
      return { buffer, filename };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      console.error(error);
      throw new ApplicationError("Failed to export submissions", 500);
    }
  }
}
