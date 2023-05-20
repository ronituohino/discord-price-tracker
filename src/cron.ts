import cron from "node-cron";
import { update } from "./services/update.js";
import type { DataBaseClient } from "./database.js";
import { users } from "./services/users.js";
import type { Client } from "discord.js";
import { getChannel } from "./discord.js";
import { splitMessageSend } from "./utils/priceParser.js";
import { assertUnreachable } from "./types.js";

export async function startJobs(
  databaseClient: DataBaseClient,
  discordClient: Client
) {
  // Cron job for updating prices, every day at 14:00
  cron.schedule("0 14 * * *", async () => {
    const usersResult = await users({ databaseClient });

    /*
    const test = [
      { productName: "RX", oldPrice: "529,90 €", newPrice: "439,90 €" },
      { productName: "Test", oldPrice: "532,90 €", newPrice: "122,90 €" },
    ];
    */

    const channel = await getChannel(discordClient);

    for (let i = 0; i < usersResult.users.length; i++) {
      const user = usersResult.users[i];
      const updateResult = await update({
        databaseClient,
        discordId: user.discordId,
      });

      switch (updateResult.status) {
        case "success":
          if (updateResult.changed.length > 0) {
            // Price updates
            const productUpdateString = updateResult.changed
              .map(
                (changed) =>
                  `${changed.productName} changed: ${changed.oldPrice} => ${changed.newPrice}`
              )
              .join("\n");
            const updateString = `Hey, <@${user.discordId}>, some of your tracked products' prices have changed:\n${productUpdateString}`;
            await splitMessageSend(updateString, channel);
          }
          break;
        case "unable_to_scrape":
          // @ts-ignore
          await channel.send(
            `Update cancelled, unable to scrape ${updateResult.product.name} from ${updateResult.product.url}`
          );
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
        default:
          assertUnreachable(updateResult.status);
      }
    }
  });
}
