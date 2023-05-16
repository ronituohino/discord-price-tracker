import dotenv from "dotenv";
dotenv.config();

import { setupClient } from "./db.js";
const dbClient = await setupClient({
  connectionString: process.env["DATABASE_URL"],
});

import { startClient } from "./discord.js";
startClient({ token: process.env["DISCORD_BOT_SECRET"], dbClient });

import { startJobs } from "./cron.js";
// startJobs();
