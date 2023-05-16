# Setting up the development environment

Install dependencies with

```
npm i
```

## Create Discord bot

Create a new Discord bot and add it to your server by following the start here:
https://docs.replit.com/tutorials/nodejs/build-basic-discord-bot-nodejs

Be sure to enable all privileged gateway intents in the developer portal for the
bot.

## .env

Get bot token from the developer portal and set it into `DISCORD_BOT_SECRET`  
Get postgres database connection string and set to `DATABASE_URL`

.env should look like this:

```
DISCORD_BOT_SECRET="..."
DATABASE_URL="..."
```
