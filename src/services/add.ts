import { DataBaseClient, addPricePoint } from "../database.js";

import { getProductPrice } from "../scrapers/index.js";
import { addProduct } from "../database.js";
import { getUserId } from "../database.js";
import { notifyIfScrapingFailed } from "../utils.js";
import { getChannel } from "../discord.js";
import { Client } from "discord.js";

type Params = {
  databaseClient: DataBaseClient;
  discordClient: Client;
  discordId: string;
  name: string | undefined;
  url: string | undefined;
};

type Return = {
  status:
    | "success"
    | "name_missing"
    | "url_missing"
    | "not_registered"
    | "unable_to_scrape"
    | "product_exists"
    | "error";
  error?: Error;
};

export async function add({
  databaseClient,
  discordClient,
  discordId,
  name,
  url,
}: Params): Promise<Return> {
  try {
    if (!name) {
      return { status: "name_missing" };
    }
    if (!url) {
      return { status: "url_missing" };
    }

    const userId = await getUserId(databaseClient, discordId);
    if (!userId) {
      return { status: "not_registered" };
    }

    const result = await getProductPrice(url);

    if (result.status !== "success") {
      const channel = await getChannel(discordClient);
      notifyIfScrapingFailed({
        scrapingResult: result,
        discordChannel: channel,
        discordId,
        productName: name,
        productUrl: url,
      });
      return { status: "unable_to_scrape" };
    }

    const productId = await addProduct(databaseClient, userId, name, url);
    await addPricePoint(databaseClient, productId, result.price);
    return { status: "success" };
  } catch (error) {
    if (error.toString().startsWith("error: duplicate key")) {
      return { status: "product_exists" };
    }
    return { status: "error", error };
  }
}
