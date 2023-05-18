import cron from "node-cron";
import { update } from "./services/update.js";
import { DataBaseClient } from "./database/index.js";
import { users } from "./services/users.js";

export function startJobs(databaseClient: DataBaseClient) {
  // Cron job for updating prices
  cron.schedule("*/30 * * * * *", async () => {
    const result = await users({ databaseClient });

    for (let i = 0; i < result.users.length; i++) {
      const user = result.users[i];
      update({ databaseClient, discordId: user.discordId });
    }
  });
}
