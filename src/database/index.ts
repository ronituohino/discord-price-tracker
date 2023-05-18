import pg, { QueryResult } from "pg";
import fs from "fs";
import type { Product } from "../types.js";

export type DataBaseClient = pg.Client;

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

type RegisterToSystem = (
  databaseClient: DataBaseClient,
  discordId: string,
  discordName: string
) => Promise<QueryResult>;

export const registerToSystem: RegisterToSystem = async (
  databaseClient,
  discordId,
  discordName
) => {
  return await databaseClient.query(
    "INSERT INTO Users(discordId, discordName) VALUES($1, $2)",
    [discordId, discordName]
  );
};

type GetUserId = (
  databaseClient: DataBaseClient,
  discordId: string
) => Promise<number | undefined>;

export const getUserId: GetUserId = async (databaseClient, discordId) => {
  return (
    await databaseClient.query("SELECT id FROM Users WHERE discordid=$1", [
      discordId,
    ])
  ).rows[0]?.id;
};

type AddProduct = (
  databaseClient: DataBaseClient,
  userId: number,
  name: string,
  url: string,
  price: string
) => Promise<QueryResult>;

export const addProduct: AddProduct = async (
  databaseClient,
  userId,
  name,
  url,
  price
) => {
  return await databaseClient.query(
    "INSERT INTO Products(user_id, name, url, price) VALUES($1, $2, $3, $4)",
    [userId, name, url, price]
  );
};

type RemoveProduct = (
  databaseClient: DataBaseClient,
  userId: number,
  name?: string
) => Promise<number | undefined>;

export const removeProduct: RemoveProduct = async (
  databaseClient,
  userId,
  name
) => {
  return (
    await databaseClient.query(
      "DELETE FROM Products WHERE user_id=$1 AND name=$2 RETURNING *",
      [userId, name]
    )
  ).rowCount;
};

type GetProducts = (
  databaseClient: DataBaseClient,
  userId: number
) => Promise<[Product]>;

export const getProducts: GetProducts = async (databaseClient, userId) => {
  const results = await databaseClient.query(
    "SELECT * FROM Products WHERE user_id=$1",
    [userId]
  );

  const products = results?.rows.map((product) => {
    return {
      userId: product.user_id,
      name: product.name,
      url: product.url,
      price: product.price,
      ceratedAt: product.created_at,
    };
  }) as unknown as [Product];
  return products;
};

type UpdatePrice = (
  databaseClient: DataBaseClient,
  userId: number,
  name: string,
  price: string
) => Promise<QueryResult>;

export const updatePrice: UpdatePrice = async (
  databaseClient,
  userId,
  name,
  price
) => {
  return await databaseClient.query(
    "UPDATE Products SET price=$1 WHERE user_id=$2 AND name=$3",
    [price, userId, name]
  );
};
