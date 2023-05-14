import cron from "node-cron";

export function startJobs() {
  // Cron job for updating prices
  cron.schedule("*/10 * * * * *", () => {
    console.log("hello");
  });
}
