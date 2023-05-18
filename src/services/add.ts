import { DataBaseClient, addPricePoint } from "../database/index.js";

import { getProductPrice } from "../scrapers/index.js";
import { addProduct } from "../database/index.js";
import { getUserId } from "../database/index.js";

type Params = {
  databaseClient: DataBaseClient;
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

    const price = await getProductPrice(url);

    if (!price) {
      return { status: "unable_to_scrape" };
    }

    const productId = await addProduct(databaseClient, userId, name, url);
    await addPricePoint(databaseClient, productId, price);
    return { status: "success" };
  } catch (error) {
    if (error.toString().startsWith("error: duplicate key")) {
      return { status: "product_exists" };
    }
    return { status: "error", error };
  }
}
