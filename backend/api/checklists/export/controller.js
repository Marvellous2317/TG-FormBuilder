import { ExportRepository } from "./repository.js";

export class ExportController {
  static async exportSubmittedChecklists(req, res, next) {
    try {
      const companyId = req.user.company?.companyId || req.user.companyId || null;
      const { documentNumber, startDate, endDate, status, limit } = req.query;
      const { buffer, filename } = await ExportRepository.exportSubmittedChecklists(
        documentNumber,
        companyId,
        { startDate, endDate, status, limit },
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.status(200).send(Buffer.from(buffer));
    } catch (e) {
      console.error("Error exporting submitted checklists:", e);
      next(e);
    }
  }
}
