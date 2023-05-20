# Setting up

## Create a Discord bot

[Follow instructions in here](./discord_bot.md).

## .env file

You need to create a file named `.env` in the root of this project.

To set up a new Discord bot and set the `DISCORD_BOT_SECRET`, follow
[these](./discord_bot.md) instructions.

Copy `DISCORD_CHANNEL_ID` by right-clicking a Discord channel the bot should
post updates on.

Make sure `<postgres password>` fields match in the file.

```
DISCORD_BOT_SECRET="..."
DISCORD_CHANNEL_ID="..."
DATABASE_URL="postgresql://postgres:<postgres password>@price-tracker-db:5432/"
POSTGRES_PASSWORD="<postgres password>"
DOCKER_PASSWORD="<docker user password>"
```

## Running the bot

Start the bot by running:

```bash
npm run start
```

or

```bash
docker-compose up
```

if you don't want to install Node.

This starts the database and the bot. The database is synced onto the host disk
so if the containers are stopped, the data will be preserved.
