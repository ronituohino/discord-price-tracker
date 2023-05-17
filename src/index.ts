import dotenv from "dotenv";
dotenv.config();

import { setupClient } from "./database/index.js";
const dbClient = await setupClient();

import { startClient } from "./discord.js";
startClient({ token: process.env["DISCORD_BOT_SECRET"], dbClient });

import { startJobs } from "./cron.js";
// startJobs();
