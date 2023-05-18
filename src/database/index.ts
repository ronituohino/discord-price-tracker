import pg from "pg";
import fs from "fs";
import { Product } from "../types.js";

export type DBClient = pg.Client;

export async function setupClient() {
  const client = new pg.Client({
    // Password and container should match those in docker-compose
    connectionString:
      "postgresql://postgres:averygoodpassowrd!@price-tracker-db:5432/postgres",
  });

  // Setup database
  await client.connect();
  const sql = fs.readFileSync("./src/database/schema.sql").toString();
  await client.query(sql);
  return client;
}

type RegisterParams = {
  client: DBClient;
  discordId: string;
  discordName: string;
};
type RegisterReturn = {
  state: "success" | "duplicate" | "error";
  error?: Error;
};

export async function register({
  client,
  discordId,
  discordName,
}: RegisterParams): Promise<RegisterReturn> {
  try {
    await client.query(
      "INSERT INTO Users(discordId, discordName) VALUES($1, $2)",
      [discordId, discordName]
    );
    return { state: "success" };
  } catch (error) {
    if (error.toString().startsWith("error: duplicate key")) {
      return { state: "duplicate" };
    }
    return { state: "error", error };
  }
}

type GetUserIdParams = {
  client: DBClient;
  discordId: string;
};
type GetUserIdReturn = number | undefined;

async function getUserId({
  client,
  discordId,
}: GetUserIdParams): Promise<GetUserIdReturn> {
  return (
    await client.query("SELECT id FROM Users WHERE discordid=$1", [discordId])
  ).rows[0]?.id;
}

type AddItemParams = {
  client: DBClient;
  discordId: string;
  name: string;
  url: string;
  price: string;
};
type AddItemReturn = {
  state: "success" | "not_registered" | "product_exists" | "error";
  error?: Error;
};

export async function addProduct({
  client,
  discordId,
  name,
  url,
  price,
}: AddItemParams): Promise<AddItemReturn> {
  try {
    const userId = await getUserId({ client, discordId });
    if (userId === undefined) {
      return { state: "not_registered" };
    }

    await client.query(
      "INSERT INTO Products(user_id, name, url, price) VALUES($1, $2, $3, $4)",
      [userId, name, url, price]
    );
    return { state: "success" };
  } catch (error) {
    if (error.toString().startsWith("error: duplicate key")) {
      return { state: "product_exists" };
    }
    return { state: "error", error };
  }
}

type RemoveItemParams = {
  client: DBClient;
  name: string;
  discordId: string;
};
type RemoveItemReturn = {
  state: "success" | "not_registered" | "product_not_found" | "error";
  error?: Error;
};

export async function removeProduct({
  client,
  name,
  discordId,
}: RemoveItemParams): Promise<RemoveItemReturn> {
  try {
    const userId = await getUserId({ client, discordId });
    if (userId === undefined) {
      return { state: "not_registered" };
    }

    const result = await client.query(
      "DELETE FROM Products WHERE user_id=$1 AND name=$2 RETURNING *",
      [userId, name]
    );

    if (result.rowCount > 0) {
      return { state: "success" };
    } else {
      return { state: "product_not_found" };
    }
  } catch (error) {
    console.log(error);
    return { state: "error", error };
  }
}

type GetProductsParams = {
  client: DBClient;
  discordId: string;
};
type GetProductsReturn = {
  state: "success" | "not_registered" | "error";
  error?: Error;
  products?: [Product];
};

export async function getProducts({
  client,
  discordId,
}: GetProductsParams): Promise<GetProductsReturn> {
  try {
    const userId = await getUserId({ client, discordId });
    if (userId === undefined) {
      return { state: "not_registered" };
    }

    const result = await client.query(
      "SELECT * FROM Products WHERE user_id=$1",
      [userId]
    );

    const products = result.rows.map(product => {
      return {
        userId: product.user_id,
        name: product.name,
        url: product.url,
        price: product.price,
        ceratedAt: product.created_at,
      };
    }) as unknown as [Product];

    return { state: "success", products };
  } catch (error) {
    return { state: "error", error };
  }
}

type UpdateItemParams = {
  client: DBClient;
  name: string;
  price: string;
};

export async function updateItem({ client, name, price }: UpdateItemParams) {}
