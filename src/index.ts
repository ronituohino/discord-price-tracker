import dotenv from "dotenv";
dotenv.config();

import Discord from "discord.js";
const client = new Discord.Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});

const token = process.env["DISCORD_BOT_SECRET"];

client.on("ready", () => {
  console.log("I'm in");
  console.log(client.user.username);
});

client.on("messageCreate", msg => {
  if (msg.author.id != client.user.id) {
    if (msg.content.length > 0 && msg.content.startsWith("/")) {
      msg.channel.send(msg.content.split("").reverse().join(""));
    }
  }
});

client.login(token);

import { startJobs } from "./cron.js";
startJobs();
