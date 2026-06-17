import { Op } from "sequelize";
import ExcelJS from "exceljs";
import {
  SubmittedChecklist,
  SubmittedChecklistEntry,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";

const EXPORT_ROW_LIMIT = 1000;

// Render a value for an Excel cell: objects/arrays are stringified, null becomes "".
function toCell(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}

// Parse entry value - if it's a JSON object/array with nested field values, expand them
// For type "section", combine all values into one string with newlines
function parseEntryValue(entry) {
  const raw = entry.value;
  const isSection = entry.type === "section";
  

  let parsed;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try { parsed = JSON.parse(trimmed); } catch { parsed = undefined; }
    }
  }


  const extractedValues = [];


  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (item && typeof item === "object") {

        for (const [fieldId, fieldData] of Object.entries(item)) {
          let actualValue;
          if (fieldData && typeof fieldData === "object" && "value" in fieldData) {
            actualValue = fieldData.value;
          } else {
            actualValue = fieldData;
          }
          extractedValues.push({ fieldId, value: toCell(actualValue) });
        }
      } else {

        extractedValues.push({ fieldId: entry.name || "", value: toCell(item) });
      }
    }
  } else if (parsed && typeof parsed === "object") {

    for (const [fieldId, fieldData] of Object.entries(parsed)) {
      let actualValue;
      if (fieldData && typeof fieldData === "object" && "value" in fieldData) {
        actualValue = fieldData.value;
      } else {
        actualValue = fieldData;
      }
      extractedValues.push({ fieldId, value: toCell(actualValue) });
    }
  }


  if (extractedValues.length) {

    if (isSection) {
      const combinedValue = extractedValues.map(v => v.value).join(", ");
      return [{ fieldId: entry.name || "", value: combinedValue }];
    }

    return extractedValues;
  }


  return [{ fieldId: entry.name || "", value: toCell(raw) }];
}

export class ExportRepository {
  static async exportSubmittedChecklists(documentNumber, companyId, { startDate, endDate, status, limit } = {}) {
    try {
      if (!documentNumber) throw new ApplicationError("documentNumber is required", 400);

      let rowLimit = limit !== undefined ? Number(limit) : EXPORT_ROW_LIMIT;
      if (!Number.isFinite(rowLimit) || rowLimit < 1) rowLimit = EXPORT_ROW_LIMIT;
      if (rowLimit > EXPORT_ROW_LIMIT) rowLimit = EXPORT_ROW_LIMIT;

      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate
        ? new Date(startDate)
        : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

      const submissionWhere = {
        companyId,
        documentNumber,
        createdAt: { [Op.gte]: start, [Op.lte]: end },
      };
      if (status) submissionWhere.status = status;

      const submissions = await SubmittedChecklist.findAll({
        where: submissionWhere,
        attributes: ["submittedChecklistId", "documentNumber", "title", "status", "submittedAt", "createdAt"],
        order: [["createdAt", "DESC"]],
      });

      const submissionIds = submissions.map((s) => s.submittedChecklistId);
      const entryRows = submissionIds.length
        ? await SubmittedChecklistEntry.findAll({
            where: { submittedChecklistId: { [Op.in]: submissionIds } },
            attributes: ["submittedChecklistId", "entryId", "name", "value", "type", "section", "status", "order"],
            order: [["order", "ASC"]],
          })
        : [];

      const entriesBySubmission = new Map();
      for (const entry of entryRows) {
        if (!entriesBySubmission.has(entry.submittedChecklistId)) {
          entriesBySubmission.set(entry.submittedChecklistId, []);
        }
        entriesBySubmission.get(entry.submittedChecklistId).push(entry);
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Submissions");
      sheet.columns = [
        { header: "Document Number", key: "documentNumber", width: 24 },
        { header: "Title", key: "title", width: 28 },
        { header: "Name", key: "name", width: 32 },
        { header: "Type", key: "type", width: 14 },
        { header: "Value", key: "value", width: 50 },
        { header: "Status", key: "status", width: 14 },
      ];
      sheet.getRow(1).font = { bold: true };

      let emitted = 0;
      for (const submission of submissions) {
        if (emitted >= rowLimit) break;

        const entries = entriesBySubmission.get(submission.submittedChecklistId) || [];

        for (const entry of entries) {
          const valueRows = parseEntryValue(entry);
          
          for (const { fieldId, value } of valueRows) {
            if (emitted >= rowLimit) break;
            
            sheet.addRow({
              documentNumber: submission.documentNumber || "",
              title: submission.title || "",
              section: entry.section || "",
              name: entry.name || fieldId || "",
              type: entry.type || "",
              value,
              status: entry.status || "",
            });
            
            emitted += 1;
          }
          if (emitted >= rowLimit) break;
        }
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
