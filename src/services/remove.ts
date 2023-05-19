import { DataBaseClient, removeProduct } from "../database.js";

import { getUserId } from "../database.js";

type Params = {
  databaseClient: DataBaseClient;
  discordId: string;
  name: string | undefined;
};

type Return = {
  status:
    | "success"
    | "name_missing"
    | "not_registered"
    | "product_not_found"
    | "error";
  error?: Error;
};

export async function remove({
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

    const rowCount = await removeProduct(databaseClient, userId, name);

    if (rowCount > 0) {
      return { status: "success" };
    } else {
      return { status: "product_not_found" };
    }
  } catch (error) {
    return { status: "error", error };
  }
}
