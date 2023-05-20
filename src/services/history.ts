import {
  DataBaseClient,
  getProductWithFullHistory,
  getUserId,
} from "../database.js";
import type { ProductWithFullHistory } from "../types.js";

type Params = {
  databaseClient: DataBaseClient;
  discordId: string;
  name: string | undefined;
};

type Return = {
  status:
    | "success"
    | "name_missing"
    | "name_wrong"
    | "not_registered"
    | "error";
  product?: ProductWithFullHistory;
  error?: Error;
};

export async function history({
  databaseClient,
  discordId,
  name,
}: Params): Promise<Return> {
  try {
    if (!name) {
      return { status: "name_missing" };
    }

    const userId = await getUserId(databaseClient, discordId);
    if (!userId) {
      return { status: "not_registered" };
    }

    const product = await getProductWithFullHistory(
      databaseClient,
      userId,
      name
    );

    if (!product) {
      return { status: "name_wrong" };
    }

    return { status: "success", product };
  } catch (error) {
    return { status: "error", error };
  }
}
