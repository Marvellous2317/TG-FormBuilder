import { Op } from "sequelize";
import {
  Checklist, ChecklistAssignment, ChecklistEntry, ChecklistApprover,
  SubmittedChecklist, SubmittedChecklistEntry, SubmittedChecklistApproval, User,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";
import { AzureImageDownloader, uploadChecklistImageValue } from "../../../utils/azureService.js";

const isOptionalSubmittedEntry = (entry) => entry?.image || entry?.section_formular || entry?.type === "image" || entry?.type === "section_formular";
const isImageSubmittedEntry = (entry, item) => entry?.image || entry?.type === "image" || item?.image !== undefined;

async function buildSubmittedEntryData(submittedChecklistId, item, original, fallbackOrder = 0) {
  const shouldUploadImage = isImageSubmittedEntry(original, item);
  const imageInput = item.image !== undefined ? item.image : shouldUploadImage ? item.value : undefined;
  const image = imageInput !== undefined ? await uploadChecklistImageValue(imageInput, original?.name || "image") : null;

  return {
    submittedChecklistId,
    entryId: item.entryId,
    name: original?.name || "",
    type: original?.type || "text",
    image,
    section_formular: item.section_formular ?? original?.section_formular ?? null,
    section: original?.section || null,
    order: original?.order || fallbackOrder,
    required: original?.required || false,
    options: original?.options || null,
    formulaExpression: original?.formulaExpression || null,
    config: original?.config || null,
    value: shouldUploadImage && item.image === undefined ? image : item.value,
  };
}

async function hydrateSubmittedEntryImages(submission) {
  if (!submission?.entries?.length) return submission;

  await Promise.all(submission.entries.map(async (entry) => {
    if (!entry.image) return;

    const imageUrl = entry.image;
    const image = await AzureImageDownloader(imageUrl);
    entry.setDataValue("imageUrl", imageUrl);
    entry.setDataValue("image", image);
  }));

  return submission;
}

export class OperatorRepository {

  static async getOperatorCheckList(userId, companyId, {page = 1, limit = 20 }) {
    try {

      const where = { assignedTo: userId, companyId };
      const offset = (page - 1) * limit;
      const { rows: assignments, count: total } = await ChecklistAssignment.findAndCountAll({
        where,
        attributes: ["assignmentId"],
        include: [
          { model: Checklist, as: "checklist", attributes: ["checklistId", "title", "documentNumber", "frequency"] },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        assignments,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
        console.error("Error fetching operator checklist:", error);
      throw new ApplicationError("Failed to fetch assignments", 500);
    }
  }

  static async getOperatorCheckEntryList(assignmentId, userId) {
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, assignedTo: userId },
        attributes: ["assignmentId"],
        include: [
          {
            model: Checklist, as: "checklist",
            include: [{
              model: ChecklistEntry, as: "entries",
              order: [["order", "ASC"]],
            }],
          },
        ],
      });

      if (!assignment) throw new ApplicationError("Assignment not found", 404);


      return { assignment};
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch assignment for filling", 500);
    }
  }

  static async submitChecklistEntry(assignmentId, userId, { data }) {
    const transaction = await sequelize.transaction();
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, assignedTo: userId },
        include: [{ model: Checklist, as: "checklist", include: [{ model: ChecklistEntry, as: "entries" }] }],
      });

      if (!assignment) throw new ApplicationError("Assignment not found", 404);

      const { frequency, frequencyInterval } = assignment.checklist;
      if (frequency) {
        const interval = Math.max(1, Number(frequencyInterval) || 1);
        const lastSubmission = await SubmittedChecklist.findOne({
          where: {
            assignmentId,
            submittedBy: userId,
            submittedAt: { [Op.ne]: null },
          },
          order: [["submittedAt", "DESC"]],
        });

        if (lastSubmission?.submittedAt) {
          const last = new Date(lastSubmission.submittedAt);
          const now = new Date();
          let blocked = false;
          let retryMessage = "";

          if (frequency === "hourly") {
            const windowMs = 60 * 60 * 1000 * interval;
            const elapsed = now.getTime() - last.getTime();
            if (elapsed < windowMs) {
              blocked = true;
              retryMessage = `Please try again in ${Math.ceil((windowMs - elapsed) / 60000)} minute(s).`;
            }
          } else if (frequency === "daily") {
            const sameDay =
              last.getFullYear() === now.getFullYear() &&
              last.getMonth() === now.getMonth() &&
              last.getDate() === now.getDate();
            if (sameDay) {
              blocked = true;
              retryMessage = "Please try again tomorrow.";
            }
          } else if (frequency === "weekly") {
            const getWeek = (d) => {
              const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
              const day = tmp.getUTCDay() || 7;
              tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
              const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
              const weekNo = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
              return `${tmp.getUTCFullYear()}-${weekNo}`;
            };
            if (getWeek(last) === getWeek(now)) {
              blocked = true;
              retryMessage = "Please try again next week.";
            }
          } else if (frequency === "monthly") {
            const sameMonth =
              last.getFullYear() === now.getFullYear() &&
              last.getMonth() === now.getMonth();
            if (sameMonth) {
              blocked = true;
              retryMessage = "Please try again next month.";
            }
          }

          if (blocked) {
            const cadence =
              interval > 1 ? `every ${interval} ${frequency.replace(/ly$/, "")}s` : frequency;
            throw new ApplicationError(
              `This checklist can only be submitted ${cadence}. ${retryMessage}`,
              400
            );
          }
        }
      }

      const requiredEntries = assignment.checklist.entries.filter((e) => e.required && !isOptionalSubmittedEntry(e));
      const responseMap = new Map(data.map((r) => [r.entryId, r.value ?? r.image]));

      for (const entry of requiredEntries) {
        const val = responseMap.get(entry.entryId);
        if (val === undefined || val === null || val === "") {
          throw new ApplicationError(`Field "${entry.name}" is required`, 400);
        }
      }

      const approverConfigs = await ChecklistApprover.findAll({
        where: { checklistId: assignment.checklistId },
        order: [["step", "ASC"], ["createdAt", "ASC"]],
        transaction,
      });
      if (approverConfigs.length === 0) {
        throw new ApplicationError("No approvers are configured for this checklist", 400);
      }

      const submittedChecklist = await SubmittedChecklist.create({
        assignmentId,
        submittedBy: userId,
        companyId: assignment.companyId,
        documentNumber: assignment.checklist.documentNumber,
        submittedAt: new Date(),
      }, { transaction });

      const entriesMap = new Map(assignment.checklist.entries.map((e) => [e.entryId, e]));
      const entryData = await Promise.all(data.map((r, index) => buildSubmittedEntryData(
        submittedChecklist.submittedChecklistId,
        r,
        entriesMap.get(r.entryId),
        index,
      )));
      await SubmittedChecklistEntry.bulkCreate(entryData, { transaction });

      const approvalData = approverConfigs.map((cfg, index) => ({
        submittedChecklistId: submittedChecklist.submittedChecklistId,
        approverId: cfg.approverId,
        step: cfg.step ?? index,
        status: "pending",
      }));
      await SubmittedChecklistApproval.bulkCreate(approvalData, { transaction });

      await transaction.commit();
      return { submittedChecklist, message: "Checklist submitted successfully" };
    } catch (error) {
      await transaction.rollback();
      console.error("Error submitting checklist:", error);
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to submit checklist", 500);
    }
  }

  static async saveDraft(assignmentId, userId, { data }) {
    const transaction = await sequelize.transaction();
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, assignedTo: userId },
        include: [{ model: Checklist, as: "checklist", include: [{ model: ChecklistEntry, as: "entries" }] }],
      });
      if (!assignment) throw new ApplicationError("Assignment not found", 404);

      let submittedChecklist = await SubmittedChecklist.findOne({
        where: { assignmentId, submittedBy: userId, status: "draft" },
        transaction,
      });

      if (!submittedChecklist) {
        submittedChecklist = await SubmittedChecklist.create({
          assignmentId,
          submittedBy: userId,
          documentNumber: assignment.checklist.documentNumber,
          companyId: assignment.companyId,
          status: "draft",
        }, { transaction });
      }

      await SubmittedChecklistEntry.destroy({
        where: { submittedChecklistId: submittedChecklist.submittedChecklistId },
        transaction,
      });

      if (data?.length > 0) {
        const entriesMap = new Map(assignment.checklist.entries.map((e) => [e.entryId, e]));
        const entryData = await Promise.all(data.map((r, index) => buildSubmittedEntryData(
          submittedChecklist.submittedChecklistId,
          r,
          entriesMap.get(r.entryId),
          index,
        )));
        await SubmittedChecklistEntry.bulkCreate(entryData, { transaction });
      }

      await transaction.commit();
      return { submittedChecklist, message: "Draft saved successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to save draft", 500);
    }
  }

  static async updateSubmission(submittedChecklistId, userId, { data }) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await SubmittedChecklist.findOne({
        where: { submittedChecklistId, submittedBy: userId },
        transaction,
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
      if (submission.status !== "pending") {
        throw new ApplicationError("Only pending submissions can be updated", 400);
      }

      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId: submission.assignmentId, assignedTo: userId },
        include: [{ model: Checklist, as: "checklist", include: [{ model: ChecklistEntry, as: "entries" }] }],
        transaction,
      });

      if (!assignment) throw new ApplicationError("Assignment not found", 404);

      const requiredEntries = assignment.checklist.entries.filter((e) => e.required && !isOptionalSubmittedEntry(e));
      const responseMap = new Map(data.map((r) => [r.entryId, r.value ?? r.image]));

      for (const entry of requiredEntries) {
        const val = responseMap.get(entry.entryId);
        if (val === undefined || val === null || val === "") {
          throw new ApplicationError(`Field "${entry.name}" is required`, 400);
        }
      }

      await SubmittedChecklistEntry.destroy({
        where: { submittedChecklistId },
        transaction,
      });

      const entriesMap = new Map(assignment.checklist.entries.map((e) => [e.entryId, e]));
      const entryData = await Promise.all(data.map((r, index) => buildSubmittedEntryData(
        submittedChecklistId,
        r,
        entriesMap.get(r.entryId),
        index,
      )));
      await SubmittedChecklistEntry.bulkCreate(entryData, { transaction });

      submission.submittedAt = new Date();
      await submission.save({ transaction });

      await transaction.commit();
      return { submittedChecklist: submission, message: "Submission updated successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update submission", 500);
    }
  }

  static async deleteSubmission(submittedChecklistId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await SubmittedChecklist.findOne({
        where: { submittedChecklistId, submittedBy: userId },
        transaction,
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
      if (submission.status !== "pending") {
        throw new ApplicationError("Only pending submissions can be deleted", 400);
      }

      await SubmittedChecklistEntry.destroy({
        where: { submittedChecklistId },
        transaction,
      });
      await submission.destroy({ transaction });

      await transaction.commit();
      return { message: "Submission deleted successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete submission", 500);
    }
  }

  static async getSubmissionById(submittedChecklistId, userId) {
    try {
      const submission = await SubmittedChecklist.findOne({
        where: { submittedChecklistId, submittedBy: userId },
        attributes: ["submittedChecklistId", "documentNumber", "status", "submittedAt"],
        include: [
          { model: User, as: "approver", attributes: ["firstName", "lastName"] },
          { model: SubmittedChecklistEntry, as: "entries" },
        ],
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
  await hydrateSubmittedEntryImages(submission);
      return { submission };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch submission", 500);
    }
  }

  static async getMySubmissions(userId, { search, status, startDate, endDate, page = 1, limit = 20 }) {
    try {
      const where = { submittedBy: userId };
      if (status) where.status = status;
      if (search) where.documentNumber = { [Op.iLike]: `%${search}%` };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }
      const offset = (page - 1) * limit;
      const { rows: submissions, count: total } = await SubmittedChecklist.findAndCountAll({
        where,
        attributes: ["submittedChecklistId", "documentNumber", "status", "submittedAt"],
        include: [
          { model: User, as: "approver", attributes: ["firstName", "lastName"] },
          {
            model: ChecklistAssignment, as: "assignment",
            attributes: ["assignmentId"],
            include: [
              { model: Checklist, as: "checklist", attributes: ["title"] },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        submissions,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch submissions", 500);
    }
  }
}
