import { DataBaseClient, getProducts } from "../database/index.js";
import { getProductPrice } from "../scrapers/index.js";
import { updatePrice, getUserId } from "../database/index.js";

type Params = {
  databaseClient: DataBaseClient;
  discordId: string;
};

type Return = {
  status: "success" | "not_registered" | "error";
  amount?: number;
  error?: Error;
};

export async function update({
  databaseClient,
  discordId,
}: Params): Promise<Return> {
  try {
    const userId = await getUserId(databaseClient, discordId);
    if (userId === undefined) {
      return { status: "not_registered" };
    }

    const products = await getProducts(databaseClient, userId);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const price = await getProductPrice(product.url);

      if (price !== product.price) {
        await updatePrice(databaseClient, userId, product.name, price);
      }
    }

    return { status: "success", amount: products.length };
  } catch (error) {
    return { status: "error", error };
  }
}
