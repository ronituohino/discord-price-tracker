DROP TABLE Products CASCADE;

CREATE TABLE IF NOT EXISTS Users (
  id SERIAL PRIMARY KEY,
  discordId TEXT NOT NULL UNIQUE,
  discordName TEXT NOT NULL,

  UNIQUE(discordId, discordName)
);

CREATE TABLE IF NOT EXISTS Products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users ON DELETE CASCADE,

  name TEXT NOT NULL,
  url TEXT NOT NULL,
  price TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS PricePoints (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES Products ON DELETE CASCADE,

  price TEXT NOT NULL,

  created_at DATE NOT NULL DEFAULT NOW()
);