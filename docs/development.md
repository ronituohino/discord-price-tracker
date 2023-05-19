# Setting up the development environment

Make sure you have [Node](https://nodejs.org/en) installed.  
Install dependencies (linting and puppeteer cache):

```bash
npm i
```

## Create a Discord bot

[Follow instructions in here](discord_bot.md).

## Postgres setup

Check if you have postgres installed:

```bash
sudo systemctl status postgresql
```

The response should have something along the lines of `Active: active (exited)`
if postgres is running. Otherwise install
[postgres](https://www.postgresql.org/).

### Setting up the database

Enter the database with:

```bash
sudo -u postgres psql
```

Create the database with:

```
CREATE DATABASE price_tracker;
```

Set database password with:

```
ALTER ROLE postgres WITH PASSWORD '<postgres password>';
```

Exit the database with:

```
\q
```

## .env.dev

Get bot token from the developer portal and set it into `DISCORD_BOT_SECRET`.  
Get `DISCORD_CHANNEL_ID` by right-clicking the channel and copying the id.  
Get postgres connection url and set it into `DATABASE_URL`.

.env.dev should look like this:

```
DISCORD_BOT_SECRET="..."
DISCORD_CHANNEL_ID="..."
DATABASE_URL="postgresql://postgres:<postgres password>@localhost:5432/price_tracker"
```

## Running the development environment

```bash
npm run dev
```
