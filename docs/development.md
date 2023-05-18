# Setting up the development environment

Make sure you have [Node](https://nodejs.org/en) installed.  
Install dependencies (linting and puppeteer cache):

```
npm i
```

### Create a Discord bot

Create a new Discord bot and add it to your server by following the start here:
https://docs.replit.com/tutorials/nodejs/build-basic-discord-bot-nodejs

Be sure to enable all privileged gateway intents in the developer portal for the
bot.

### Postgres setup

Check if you have postgres installed:

```
sudo systemctl status postgresql
```

The response should have something along the lines of `Active: active (exited)`
if postgres is running. Otherwise install
[postgres](https://www.postgresql.org/).

#### Setting up the databases

Enter the database with:

```
sudo -u postgres psql
```

Create the database with:

```
CREATE DATABASE price_tracker;
```

Set database password with:

```
ALTER ROLE postgres WITH PASSWORD '<a good password>';
```

Exit the database with:

```
\q
```

### .env

Get bot token from the developer portal and set it into `DISCORD_BOT_SECRET` Get
postgres connection url and set it into `DATABASE_URL`

.env should look like this:

```
DISCORD_BOT_SECRET="..."
DATABASE_URL="postgresql://postgres:<a good password>@localhost:5432/price_tracker"
```

## Running the development environment

```
npm run dev
```
