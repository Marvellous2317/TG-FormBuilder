import express from "express";

import templateRoutes from "./templates/route.js";
import assignmentRoutes from "./assignments/route.js";
import submissionRoutes from "./submissions/route.js";
import reviewRoutes from "./review/route.js";

const router = express.Router();


router.use("/templates", templateRoutes);


router.use("/assignments", assignmentRoutes);

router.use("/my", submissionRoutes);

router.use("/review", reviewRoutes);

export default router;
