import cron from "node-cron";
import { update } from "./services/update.js";
import type { DataBaseClient } from "./database.js";
import { users } from "./services/users.js";
import type { Client } from "discord.js";

export async function startJobs(
  databaseClient: DataBaseClient,
  discordClient: Client
) {
  const channel = await discordClient.channels.fetch(
    process.env["DISCORD_CHANNEL_ID"]
  );

  // Cron job for updating prices, every day at 14:00
  cron.schedule("*/15 * * * * *", async () => {
    const usersResult = await users({ databaseClient });
    const test = [
      { productName: "RX", oldPrice: "529,90 €", newPrice: "439,90 €" },
    ];

    for (let i = 0; i < usersResult.users.length; i++) {
      const user = usersResult.users[i];
      const updateResult = await update({
        databaseClient,
        discordId: user.discordId,
      });

      switch (updateResult.status) {
        case "success":
          if (test.length > 0) {
            // Price updates
            const productUpdateString = test
              .map(
                (changed) =>
                  `${changed.productName} price has changed: ${changed.oldPrice} => ${changed.newPrice}`
              )
              .join("\n");
            const updateString = `Hey, <@${user.discordId}>, some of your tracked products' prices have changed:\n${productUpdateString}`;
            console.log("what");
            // @ts-ignore
            await channel.send(updateString);
          }
          break;
        case "not_registered":
          // @ts-ignore
          await channel.send(
            `Error, ${user.discordName} is tracking products, but their account has been deleted.`
          );
          break;
        case "error":
          // @ts-ignore
          await channel.send(`Something went wrong: ${updateResult.error}`);
          break;
      }
    }
  });
}
