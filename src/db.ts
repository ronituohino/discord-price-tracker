import pg from "pg";

export type DBClient = pg.Client;

type SetupClientParams = {
  connectionString: string;
};

export async function setupClient({ connectionString }: SetupClientParams) {
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: true,
    },
  });
  return client;
}

type AddItemParams = {
  client: DBClient;
  name: string;
  url: string;
  price: string;
};

export async function addItem({ client, name, url, price }: AddItemParams) {
  await client.connect();

  const res = await client.query("SELECT $1::text as message", [
    "Hello world!",
  ]);
  console.log(res.rows[0].message); // Hello world!
  await client.end();
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
