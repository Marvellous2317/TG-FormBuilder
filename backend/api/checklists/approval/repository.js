import { Op } from "sequelize";
import {
  Checklist,
  ChecklistAssignment,
  ChecklistEntry,
  SubmittedChecklist,
  SubmittedChecklistEntry,
  SubmittedChecklistApproval,
  User,
  Company,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";
import { AzureImageDownloader, uploadChecklistImageValue } from "../../../utils/azureService.js";

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

// In sequential mode an approver can only act once every lower-step row is approved.
function isApproverTurn(approvals, myStep) {
  return approvals.every((a) => a.step >= myStep || a.status === "approved");
}

export class ApprovalRepository {
  static async getPendingSubmissions(approverId, { page = 1, limit = 20 }) {
    try {
      const pendingRows = await SubmittedChecklistApproval.findAll({
        where: { approverId, status: "pending" },
        include: [
          {
            model: SubmittedChecklist,
            as: "submittedChecklist",
            required: true,
            where: { status: "pending" },
            include: [
              {
                model: ChecklistAssignment,
                as: "assignment",
                include: [
                  {
                    model: Checklist,
                    as: "checklist",
                    attributes: ["checklistId", "title", "documentNumber", "approvalMode"],
                  },
                  {
                    model: User,
                    as: "operator",
                    attributes: ["userId", "firstName", "lastName"],
                  },
                ],
              },
            ],
          },
        ],
        order: [[{ model: SubmittedChecklist, as: "submittedChecklist" }, "submittedAt", "DESC"]],
      });

      if (pendingRows.length === 0) {
        return {
          submissions: [],
          pagination: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 },
        };
      }

      const submissionIds = pendingRows.map((r) => r.submittedChecklistId);
      const allApprovals = await SubmittedChecklistApproval.findAll({
        where: { submittedChecklistId: { [Op.in]: submissionIds } },
        attributes: ["submittedChecklistId", "approverId", "step", "status"],
      });
      const approvalsBySubmission = new Map();
      for (const a of allApprovals) {
        if (!approvalsBySubmission.has(a.submittedChecklistId)) approvalsBySubmission.set(a.submittedChecklistId, []);
        approvalsBySubmission.get(a.submittedChecklistId).push(a);
      }

      const actionable = pendingRows.filter((row) => {
        const mode = row.submittedChecklist?.assignment?.checklist?.approvalMode || "sequential";
        if (mode === "parallel") return true;
        const chain = approvalsBySubmission.get(row.submittedChecklistId) || [];
        return isApproverTurn(chain, row.step);
      });

      const total = actionable.length;
      const offset = (page - 1) * limit;
      const submissions = actionable
        .slice(offset, offset + Number(limit))
        .map((row) => row.submittedChecklist);

      return {
        submissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch pending submissions", 500);
    }
  }

  static async getSubmissionById(submittedChecklistId, approverId) {
    try {
      const membership = await SubmittedChecklistApproval.findOne({
        where: { submittedChecklistId, approverId },
      });
      if (!membership) throw new ApplicationError("Submission not found", 404);

      const submission = await SubmittedChecklist.findByPk(
        submittedChecklistId,
        {
          attributes: ["submittedChecklistId", "status"],
          include: [
            {
              model: ChecklistAssignment,
              as: "assignment",
              attributes: ["assignmentId"],
              include: [
                {
                  model: Checklist,
                  as: "checklist",
                  attributes: ["checklistId", "title", "documentNumber", "approvalMode"],
                },
                {
                  model: User,
                  as: "operator",
                  attributes: ["userId", "firstName", "lastName", "email", "signature"],
                  include: [
                    {
                      model: Company,
                      as: "company",
                      attributes: ["companyName"],
                    },
                  ],
                },
              ],
            },
            {
              model: SubmittedChecklistApproval,
              as: "approvals",
              attributes: ["approverId", "step", "status", "decidedAt"],
              include: [
                { model: User, as: "approver", attributes: ["userId", "firstName", "lastName"] },
              ],
            },
            {
              model: SubmittedChecklistEntry,
              as: "entries",
              order: [["order", "ASC"]],
              attributes: [
                "entryId",
                "formulaExpression",
                "options",
                "required",
                "config",
                "name",
                "value",
                "type",
                "image",
                "section_formular",
                "order",
              ],
            },
          ],
        },
      );

      if (!submission) throw new ApplicationError("Submission not found", 404);
      await hydrateSubmittedEntryImages(submission);
      return { submission };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch submission", 500);
    }
  }

  static async approveSubmission(submittedChecklistId, approverId, { data }) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await SubmittedChecklist.findByPk(
        submittedChecklistId,
        {
          include: [
            {
              model: ChecklistAssignment,
              as: "assignment",
              include: [
                {
                  model: Checklist,
                  as: "checklist",
                  include: [{ model: ChecklistEntry, as: "entries" }],
                },
              ],
            },
            { model: SubmittedChecklistApproval, as: "approvals" },
          ],
          transaction,
        },
      );

      if (!submission) throw new ApplicationError("Submission not found", 404);
      if (submission.status !== "pending") {
        throw new ApplicationError("Only pending submissions can be approved", 400);
      }

      const approvals = submission.approvals || [];
      const myApproval = approvals.find((a) => a.approverId === approverId);
      if (!myApproval) throw new ApplicationError("You are not an approver for this submission", 404);
      if (myApproval.status !== "pending") {
        throw new ApplicationError("You have already submitted a decision for this submission", 400);
      }

      const mode = submission.assignment?.checklist?.approvalMode || "sequential";
      if (mode === "sequential" && !isApproverTurn(approvals, myApproval.step)) {
        throw new ApplicationError("Waiting for earlier approvers to approve first", 400);
      }

      const existingEntries = await SubmittedChecklistEntry.findAll({
        where: { submittedChecklistId },
        transaction,
      });
      const existingMap = new Map(existingEntries.map((e) => [e.entryId, e]));

      for (const item of data) {
        const existing = existingMap.get(item.entryId);
        if (!existing) continue;
        const updates = {};

        if (item.image !== undefined) {
          updates.image = await uploadChecklistImageValue(item.image, existing?.name || "image");
          if (item.value === undefined) updates.value = updates.image;
        } else if (existing?.image && item.value !== undefined) {
          updates.image = await uploadChecklistImageValue(item.value, existing.name || "image");
          updates.value = updates.image;
        } else if (item.value !== undefined) {
          updates.value = item.value;
        }

        if (item.section_formular !== undefined) {
          updates.section_formular = item.section_formular;
        }

        if (Object.keys(updates).length > 0) {
          await existing.update(updates, { transaction });
        }
      }

      myApproval.status = "approved";
      myApproval.decidedAt = new Date();
      await myApproval.save({ transaction });

      const allApproved = approvals.every(
        (a) => a.approverId === approverId || a.status === "approved",
      );

      let message = "Your approval has been recorded";
      if (allApproved) {
        await SubmittedChecklistEntry.update(
          { status: "approved" },
          { where: { submittedChecklistId }, transaction },
        );
        submission.status = "approved";
        submission.approvedBy = approverId;
        await submission.save({ transaction });
        message = "Submission approved successfully";
      }

      await transaction.commit();
      return { submittedChecklist: submission, message };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to approve submission", 500);
    }
  }

  static async rejectSubmission(submittedChecklistId, approverId) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await SubmittedChecklist.findByPk(
        submittedChecklistId,
        {
          include: [
            {
              model: ChecklistAssignment,
              as: "assignment",
              include: [{ model: Checklist, as: "checklist", attributes: ["approvalMode"] }],
            },
            { model: SubmittedChecklistApproval, as: "approvals" },
          ],
          transaction,
        },
      );

      if (!submission) throw new ApplicationError("Submission not found", 404);
      if (submission.status !== "pending") {
        throw new ApplicationError("Only pending submissions can be rejected", 400);
      }

      const approvals = submission.approvals || [];
      const myApproval = approvals.find((a) => a.approverId === approverId);
      if (!myApproval) throw new ApplicationError("You are not an approver for this submission", 404);
      if (myApproval.status !== "pending") {
        throw new ApplicationError("You have already submitted a decision for this submission", 400);
      }

      const mode = submission.assignment?.checklist?.approvalMode || "sequential";
      if (mode === "sequential" && !isApproverTurn(approvals, myApproval.step)) {
        throw new ApplicationError("Waiting for earlier approvers to act first", 400);
      }

      const decidedAt = new Date();
      myApproval.status = "rejected";
      myApproval.decidedAt = decidedAt;
      await myApproval.save({ transaction });

      // The submission as a whole is now terminal. Mark every remaining pending
      // approver row as rejected too (prior "approved" rows are kept for audit)
      // so the rejected submission appears in every involved approver's history
      // instead of vanishing for those who never got their turn.
      await SubmittedChecklistApproval.update(
        { status: "rejected", decidedAt },
        {
          where: {
            submittedChecklistId,
            status: "pending",
            approverId: { [Op.ne]: approverId },
          },
          transaction,
        },
      );

      submission.status = "rejected";
      submission.approvedBy = approverId;
      await submission.save({ transaction });

      await SubmittedChecklistEntry.update(
        { status: "rejected" },
        { where: { submittedChecklistId }, transaction },
      );

      await transaction.commit();
      return { message: "Submission rejected successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to reject submission", 500);
    }
  }

  static async getHistory(
    approverId,
    { status, search, startDate, endDate, page = 1, limit = 20 },
  ) {
    try {
      const approvalWhere = { approverId };
      if (status) {
        approvalWhere.status = status;
      } else {
        approvalWhere.status = { [Op.in]: ["approved", "rejected"] };
      }
      if (startDate || endDate) {
        approvalWhere.decidedAt = {};
        if (startDate) approvalWhere.decidedAt[Op.gte] = new Date(startDate);
        if (endDate) approvalWhere.decidedAt[Op.lte] = new Date(endDate);
      }

      const submissionWhere = {};
      if (search) {
        submissionWhere.documentNumber = { [Op.iLike]: `%${search}%` };
      }

      const offset = (page - 1) * limit;
      const { rows, count: total } = await SubmittedChecklistApproval.findAndCountAll({
        where: approvalWhere,
        include: [
          {
            model: SubmittedChecklist,
            as: "submittedChecklist",
            required: true,
            where: Object.keys(submissionWhere).length ? submissionWhere : undefined,
            include: [
              { model: User, as: "submitter", attributes: ["userId", "firstName", "lastName"] },
            ],
          },
        ],
        order: [["decidedAt", "DESC"]],
        limit,
        offset,
      });

      const submissions = rows.map((row) => {
        const submission = row.submittedChecklist;
        submission.setDataValue("myDecision", row.status);
        submission.setDataValue("decidedAt", row.decidedAt);
        return submission;
      });

      return {
        submissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch review history", 500);
    }
  }
}
