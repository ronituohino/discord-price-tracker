import type { DataBaseClient } from "../database.js";
import { registerToSystem } from "../database.js";

type Params = {
  databaseClient: DataBaseClient;
  discordId: string;
  discordName: string;
};

type Return = {
  status: "success" | "duplicate" | "error";
  error?: Error;
};

export async function register({
  databaseClient,
  discordId,
  discordName,
}: Params): Promise<Return> {
  try {
    await registerToSystem(databaseClient, discordId, discordName);
    return { status: "success" };
  } catch (error) {
    if (error.toString().startsWith("error: duplicate key")) {
      return { status: "duplicate" };
    }
    return { status: "error", error };
  }
}
