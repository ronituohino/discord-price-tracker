import { DataBaseClient, getProducts } from "../database/index.js";
import { getProductPrice } from "../scrapers/index.js";
import { addPricePoint, getUserId } from "../database/index.js";

type Params = {
  databaseClient: DataBaseClient;
  discordId: string;
};

type ChangedList = [
  { productName: string; oldPrice: string; newPrice: string }?
];

type Return = {
  status: "success" | "not_registered" | "error";
  amount?: number;
  changed?: ChangedList;
  error?: Error;
};

export async function update({
  databaseClient,
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
      const price = await getProductPrice(product.url);

      // If the price has changed
      if (price !== product.price) {
        changed.push({
          productName: product.name,
          oldPrice: product.price,
          newPrice: price,
        });
      }

      await addPricePoint(databaseClient, product.id, price);
    }

    return { status: "success", amount: products.length, changed };
  } catch (error) {
    return { status: "error", error };
  }
}
