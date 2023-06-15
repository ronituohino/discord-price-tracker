import type { Channel } from "discord.js";
import { ChangedList } from "./services/update.js";
import { ScrapingResult } from "./scrapers/index.js";
import { assertUnreachable } from "./types.js";

// Price are stored in the format {currencyFull (1+ numbers)},{currencyPartial (2 numbers)} {currencySign (€ or $)}
// eg. 423,90 € or 332,55 $ or 12313453,50 €
// Hopefully this makes sense lol
export function isCurrencyString(price: string): boolean {
  const re = new RegExp("^[0-9]+,[0-9]{2} [€$]$");
  return re.test(price);
}

// This turns currency strings into a comparable value
// eg. 42390 or 33255
export function string2int(price: string) {
  return parseInt(price.trim().split(" ")[0].replace(",", ""));
}

// Discord has a hard limit of 2000 chars per message
// This splits the message into multiple messages recursively to avoid that
export async function splitMessageSend(message: string, channel: Channel) {
  if (message.length > 2000) {
    const [first, second] = [message.slice(0, 2000), message.slice(2000)];
    // @ts-ignore
    await channel.send(first);
    await splitMessageSend(second, channel);
  } else {
    // @ts-ignore
    await channel.send(message);
  }
}

export function productUpdatesString(changed: ChangedList) {
  return changed
    .map(
      (changed) =>
        `${changed.productName} changed: ${changed.oldPrice} -> ${changed.newPrice}`
    )
    .join("\n");
}

type NotifyIfScrapingFailedParams = {
  scrapingResult: ScrapingResult;
  discordId: string;
  discordChannel: Channel;
  productName: string;
  productUrl: string;
};
export async function notifyIfScrapingFailed({
  scrapingResult,
  discordId,
  discordChannel,
  productName,
  productUrl,
}: NotifyIfScrapingFailedParams) {
  if (scrapingResult.status !== "success") {
    switch (scrapingResult.status) {
      case "product_removed":
        // @ts-ignore
        await discordChannel.send(
          `Hey <@${discordId}>, your product ${productName} has been removed from <${productUrl}>.`
        );
        break;
      case "currency_format_incorrect":
        // @ts-ignore
        await discordChannel.send(
          `Unable to parse price from <${productUrl}>, parsed ${scrapingResult.price} which is not right format.`
        );
        break;
      case "unable_to_scrape":
        // @ts-ignore
        await discordChannel.send(
          `Unable to scrape price from <${productUrl}>.`
        );
        break;
      case "no_scraper_found":
        // @ts-ignore
        await discordChannel.send(
          `Cannot scrape ${productName} from <${productUrl}>, because a compatible scraper was not found.`
        );
        break;
      case "error":
        // @ts-ignore
        await discordChannel.send(
          `Something went wrong parsing <${productUrl}>: ${scrapingResult.error}`
        );
        break;
      default:
        assertUnreachable(scrapingResult.status);
    }
  }
}
