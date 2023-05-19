import { DataBaseClient, getUsers } from "../database.js";
import { User } from "../types.js";

type Params = {
  databaseClient: DataBaseClient;
};

type Return = {
  status: "success" | "error";
  users?: User[];
  error?: Error;
};

export async function users({ databaseClient }: Params): Promise<Return> {
  try {
    const users = await getUsers(databaseClient);
    return { status: "success", users };
  } catch (error) {
    return { status: "error", error };
  }
}
