import pg from "pg";

type Params = {
  connectionString: string;
};

export async function getClient({ connectionString }: Params) {
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: true,
    },
  });
  await client.connect();

  const res = await client.query("SELECT $1::text as message", [
    "Hello world!",
  ]);
  console.log(res.rows[0].message); // Hello world!
  await client.end();
}
