DROP TABLE PricePoints CASCADE;

CREATE TABLE IF NOT EXISTS Users (
  id SERIAL PRIMARY KEY,
  discord_id TEXT NOT NULL UNIQUE,
  discord_name TEXT NOT NULL,
  UNIQUE(discord_id, discord_name)
);

CREATE TABLE IF NOT EXISTS Products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  price TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS PricePoints (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES Products ON DELETE CASCADE,
  price TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);