import pg from "pg";
import fs from "fs";

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
  id: number;
  discordid: string;
  discordname: string;
};

export async function register({
  client,
  discordId,
  discordName,
}: RegisterParams): Promise<RegisterReturn> {
  const result = await client.query(
    "INSERT INTO Users(discordId, discordName) VALUES($1, $2) RETURNING *",
    [discordId, discordName]
  );
  return result.rows[0];
}

type AddItemParams = {
  client: DBClient;
  discordId: string;
  name: string;
  url: string;
  price: string;
};
type AddItemReturn = {
  name: string;
};

export async function addItem({
  client,
  discordId,
  name,
  url,
  price,
}: AddItemParams) {
  const userId = (
    await client.query("SELECT id FROM Users WHERE discordid=$1", [discordId])
  ).rows[0].id;

  console.log(userId);

  const result = await client.query(
    "INSERT INTO Products(user_id, name, url, price) VALUES($1, $2, $3, $4) RETURNING *",
    [userId, name, url, price]
  );
  return result.rows[0];
}

type RemoveItemParams = {
  client: DBClient;
  name: string;
};

export async function removeItem({ client, name }: RemoveItemParams) {}

export async function getItems() {}

type UpdateItemParams = {
  client: DBClient;
  name: string;
  price: string;
};

export async function updateItem({ client, name, price }: UpdateItemParams) {}
