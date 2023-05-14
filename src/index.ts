import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const postgresClient = new pg.Client({
  connectionString: process.env["DATABASE_CONNECTION"],
  ssl: {
    rejectUnauthorized: true,
  },
});
await postgresClient.connect();

const res = await postgresClient.query("SELECT $1::text as message", [
  "Hello world!",
]);
console.log(res.rows[0].message); // Hello world!
await postgresClient.end();

import Discord from "discord.js";
const discordClient = new Discord.Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});

const token = process.env["DISCORD_BOT_SECRET"];

discordClient.on("ready", () => {
  console.log("I'm in");
  console.log(discordClient.user.username);
});

discordClient.on("messageCreate", msg => {
  if (msg.author.id != discordClient.user.id) {
    if (msg.content.length > 0 && msg.content.startsWith("/")) {
      msg.channel.send(msg.content.split("").reverse().join(""));
    }
  }
});

discordClient.login(token);

import { startJobs } from "./cron.js";
startJobs();
