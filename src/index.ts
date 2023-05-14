import dotenv from "dotenv";
dotenv.config();

import { getClient } from "./db.js";
// getClient({ connectionString: process.env["DATABASE_CONNECTION"] });

import { startClient } from "./discord.js";
// startClient({ token: process.env["DISCORD_BOT_SECRET"] });

import { startJobs } from "./cron.js";
// startJobs();
