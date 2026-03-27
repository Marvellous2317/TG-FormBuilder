import cron from "cron";
import { SupervisorRepository } from "../supervisor/repository.js";

export const openCaseCronJob = new cron.CronJob(
  "0 */3 * * *",
  async function () {
    try {
      console.log("Running 3-hour open case notification job...");

      const supervisors = await SupervisorRepository.getTotalOpenCasewithSupervisor();

    } catch (error) {
      console.error("Cron job error:", error);
    }
  },
  null,
  true, 
  "Africa/Lagos"
);
