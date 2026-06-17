import express from "express";

import adminRoutes from "./admin/route.js";
import operatorRoutes from "./operator/route.js";
import approvalRoutes from "./approval/route.js";
import exportRoutes from "./export/route.js";

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/operator", operatorRoutes);
router.use("/approval", approvalRoutes);
router.use("/export", exportRoutes);

export default router;
