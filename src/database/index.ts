import pg, { QueryResult } from "pg";
import fs from "fs";
import type {
  Product,
  ProductWithFullHistory,
  PricePoint,
  User,
} from "../types.js";

export type DataBaseClient = pg.Client;

// Turn off node-pg time parsers
const TYPE_TIMESTAMP = 1114;
const TYPE_TIMESTAMPZ = 1184;
const noParse = (v) => v;
pg.types.setTypeParser(TYPE_TIMESTAMP, noParse);
pg.types.setTypeParser(TYPE_TIMESTAMPZ, noParse);

export async function setupClient(connectionString: string) {
  const client = new pg.Client({
    connectionString,
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
    "INSERT INTO Users(discord_id, discord_name) VALUES($1, $2)",
    [discordId, discordName]
  );
};

type GetUserId = (
  databaseClient: DataBaseClient,
  discordId: string
) => Promise<number | undefined>;

export const getUserId: GetUserId = async (databaseClient, discordId) => {
  return (
    await databaseClient.query("SELECT id FROM Users WHERE discord_id=$1", [
      discordId,
    ])
  )?.rows[0]?.id;
};

type GetUsers = (databaseClient: DataBaseClient) => Promise<User[]>;

export const getUsers: GetUsers = async (databaseClient) => {
  const users = (
    await databaseClient.query("SELECT id, discord_id, discord_name FROM Users")
  )?.rows.map((user) => {
    return {
      id: user.id,
      discordId: user.discord_id,
      discordName: user.discord_name,
    } as unknown as User;
  });
  return users;
};

type AddProduct = (
  databaseClient: DataBaseClient,
  userId: number,
  name: string,
  url: string
) => Promise<number>;

// Remember to add a price point to set a price for the product!
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
      `SELECT id, user_id, name, url, created_at, price FROM Products WHERE user_id=$1`,
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

  console.log(prices);

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
  await databaseClient.query(
    "INSERT INTO PricePoints(product_id, price) VALUES($1, $2)",
    [productId, price]
  );

  return await databaseClient.query(
    "UPDATE Products SET price=$1 WHERE id=$2",
    [price, productId]
  );
};
