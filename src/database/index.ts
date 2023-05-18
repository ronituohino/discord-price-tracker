import pg, { QueryResult } from "pg";
import fs from "fs";
import type { Product, ProductWithFullHistory, PricePoint } from "../types.js";

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
  )?.rows[0]?.id;
};

type AddProduct = (
  databaseClient: DataBaseClient,
  userId: number,
  name: string,
  url: string
) => Promise<number>;

export const addProduct: AddProduct = async (
  databaseClient,
  userId,
  name,
  url
) => {
  return (
    await databaseClient.query(
      "INSERT INTO Products(user_id, name, url) VALUES($1, $2, $3) RETURNING id",
      [userId, name, url]
    )
  )?.rows[0]?.id;
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
  const products = (
    await databaseClient.query(
      `SELECT A.id, A.user_id, A.name, A.url, A.created_at, B.price 
    FROM Products A, PricePoints B 
    WHERE A.user_id=$1 AND A.current_price_id=B.id`,
      [userId]
    )
  )?.rows.map((product) => {
    return {
      id: product.id,
      userId: product.user_id,
      name: product.name,
      url: product.url,
      price: product.price,
      createdAt: product.created_at,
    };
  }) as unknown as [Product];

  return products;
};

type GetProductWithFullHistory = (
  databaseClient: DataBaseClient,
  userId: number,
  name: string
) => Promise<ProductWithFullHistory>;

export const getProductWithFullHistory: GetProductWithFullHistory = async (
  databaseClient,
  userId,
  name
) => {
  const product = (
    await databaseClient.query(
      "SELECT id, user_id, name, url, created_at FROM Products WHERE user_id=$1 AND name=$2",
      [userId, name]
    )
  )?.rows[0];

  const prices = (
    await databaseClient.query(
      "SELECT price, created_at FROM PricePoints WHERE product_id=$1",
      [product.id]
    )
  )?.rows.map((price) => {
    return {
      price: price.price,
      createdAt: product.created_at,
    };
  }) as unknown as [PricePoint];

  return {
    id: product.id,
    userId: product.user_id,
    name: product.name,
    url: product.url,
    pricePoints: prices,
    createdAt: product.created_at,
  } as unknown as ProductWithFullHistory;
};

type AddPricePoint = (
  databaseClient: DataBaseClient,
  productId: number,
  price: string
) => Promise<QueryResult>;

export const addPricePoint: AddPricePoint = async (
  databaseClient,
  productId,
  price
) => {
  const pricePointId = (
    await databaseClient.query(
      "INSERT INTO PricePoints(product_id, price) VALUES($1, $2) RETURNING id",
      [productId, price]
    )
  )?.rows[0]?.id;

  return await databaseClient.query(
    "UPDATE Products SET current_price_id=$1 WHERE id=$2",
    [pricePointId, productId]
  );
};
