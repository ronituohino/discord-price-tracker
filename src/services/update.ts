import { DataBaseClient, getProducts } from "../database.js";
import { getProductPrice } from "../scrapers/index.js";
import { addPricePoint, getUserId } from "../database.js";
import { Product } from "../types.js";
import type { Client } from "discord.js";
import { getChannel } from "../discord.js";

import { notifyIfScrapingFailed } from "../utils.js";

type Params = {
  databaseClient: DataBaseClient;
  discordClient: Client;
  discordId: string;
};

export type ChangedList = [
  { productName: string; oldPrice: string; newPrice: string }?
];

type Return = {
  status: "success" | "not_registered" | "error";
  amount?: number;
  product?: Product;
  changed?: ChangedList;
  error?: Error;
};

export async function update({
  databaseClient,
  discordClient,
  discordId,
}: Params): Promise<Return> {
  try {
    const userId = await getUserId(databaseClient, discordId);
    if (!userId) {
      return { status: "not_registered" };
    }

    const products = await getProducts(databaseClient, userId);
    let changed = [] as ChangedList;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const result = await getProductPrice(product.url);

      if (result.status !== "success") {
        // Some sort of error occurred when updating this product
        // Notify in Discord but continue on with other products
        const channel = await getChannel(discordClient);
        notifyIfScrapingFailed({
          scrapingResult: result,
          discordChannel: channel,
          discordId,
          productName: product.name,
          productUrl: product.url,
        });
        continue;
      }

      // If the price has changed
      if (result.price !== product.price) {
        changed.push({
          productName: product.name,
          oldPrice: product.price,
          newPrice: result.price,
        });
      }

      await addPricePoint(databaseClient, product.id, result.price);
    }

    return { status: "success", amount: products.length, changed };
  } catch (error) {
    return { status: "error", error };
  }
}
