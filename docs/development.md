# Setting up the development environment

The development environment has been dockerized.

## Create Discord bot

Create a new Discord bot and add it to your server by following the start here:
https://docs.replit.com/tutorials/nodejs/build-basic-discord-bot-nodejs

Be sure to enable all privileged gateway intents in the developer portal for the
bot.

## .env

Get bot token from the developer portal and set it into `DISCORD_BOT_SECRET`

.env should look like this:

```
DISCORD_BOT_SECRET="..."
```

## Run the development environment

Make sure you have [Node](https://nodejs.org/en) installed.  
Install dependencies (linting and puppeteer cache):

```
npm i
```

Make sure you have [Docker](https://www.docker.com/) and
[docker-compose](https://docs.docker.com/compose/) installed and then run:

```
npm run dev
```

If you install deps or something goes wrong and you need to rebuild the images,
run:

```
npm run rebuild
```
