import { DataBaseClient, getProducts, getUserId } from "../database/index.js";
import { Product } from "../types.js";

type Params = {
  databaseClient: DataBaseClient;
  discordId: string;
};

type Return = {
  status: "success" | "not_registered" | "error";
  products?: Product[];
  error?: Error;
};

export async function list({
  databaseClient,
  discordId,
}: Params): Promise<Return> {
  try {
    const userId = await getUserId(databaseClient, discordId);
    if (!userId) {
      return { status: "not_registered" };
    }

    const products = await getProducts(databaseClient, userId);

    return { status: "success", products };
  } catch (error) {
    return { status: "error", error };
  }
}
