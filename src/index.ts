import dotenv from "dotenv";
dotenv.config();

import { setupClient } from "./database.js";
const databaseClient = await setupClient(process.env["DATABASE_URL"]);

import { startClient } from "./discord.js";
const discordClient = startClient({
  token: process.env["DISCORD_BOT_SECRET"],
  databaseClient,
});

import { startJobs } from "./cron.js";
startJobs(databaseClient, discordClient);
