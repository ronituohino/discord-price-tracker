import Discord, { Client, Message } from "discord.js";
import {
  DBClient,
  addProduct,
  removeProduct,
  updatePrice,
  getProducts,
  register,
} from "./database/index.js";
import { assertUnreachable } from "./types.js";

type Params = {
  token: string;
  dbClient: DBClient;
};

export function startClient({ token, dbClient }: Params) {
  const client = new Discord.Client({
    intents: ["Guilds", "GuildMessages", "MessageContent"],
  });

  // Add events to client
  client.on("ready", () => {
    console.log(`Logged in as: ${client.user.username}`);
  });

  client.on("messageCreate", message => {
    if (message.author.id != client.user.id) {
      if (message.content.length > 0 && message.content.startsWith("/")) {
        handleCommand(client, message, dbClient);
      }
    }
  });

  client.login(token);
}

async function handleCommand(
  discordClient: Client,
  message: Message,
  dbClient: DBClient
) {
  const [command, params] = parseMessage(message.content);

  const func = {
    // add user to database, /register
    "/register": async () => {
      const result = await register({
        client: dbClient,
        discordId: message.author.id,
        discordName: message.author.username,
      });

      switch (result.state) {
        case "success":
          message.channel.send(
            `Created new user, hi ${message.author.username}!`
          );
          break;
        case "duplicate":
          message.channel.send(
            `You are already registered, ${message.author.username}.`
          );
          break;
        case "error":
          message.channel.send(`Something went wrong: ${result.error}`);
          break;
        default:
          assertUnreachable(result.state);
      }
    },

    // add product to track, /add {name}, {url}
    "/add": async () => {
      const result = await addProduct({
        discordId: message.author.id,
        client: dbClient,
        name: params[0].trim(),
        url: params[1].trim(),
        price: "0",
      });

      switch (result.state) {
        case "success":
          message.channel.send(`Tracking ${params[0]}!`);
          break;
        case "not_registered":
          message.channel.send(`You need to /register to add products.`);
          break;
        case "product_exists":
          message.channel.send(`You are already tracking this product.`);
          break;
        case "name_missing":
          message.channel.send(
            "You need to provide a name for the product: /add {name}, {url}"
          );
          break;
        case "url_missing":
          message.channel.send(
            "You need to provide a url for the product: /add {name}, {url}"
          );
          break;
        case "error":
          message.channel.send(`Something went wrong: ${result.error}`);
          break;
        default:
          assertUnreachable(result.state);
      }
    },

    // remove product from tracking, /remove {name}
    "/remove": async () => {
      const result = await removeProduct({
        client: dbClient,
        name: params[0],
        discordId: message.author.id,
      });

      switch (result.state) {
        case "success":
          message.channel.send(`No longer tracking ${params[0]}.`);
          break;
        case "not_registered":
          message.channel.send(
            `You need to /register and track something to remove products.`
          );
          break;
        case "product_not_found":
          message.channel.send(`This product is not being tracked.`);
          break;
        case "name_missing":
          message.channel.send(
            "You need to provide a name for the product: /add {name}, {url}"
          );
          break;
        case "error":
          message.channel.send(`Something went wrong: ${result.error}`);
          break;
        default:
          assertUnreachable(result.state);
      }
    },

    // update product prices manually, /update
    "/update": async () => {
      const result = await updatePrice({
        client: dbClient,
        discordId: message.author.id,
        name: params[0],
        price: "10 €",
      });

      switch (result.state) {
        case "success":
          message.channel.send(`Product price updated.`);
          break;
        case "not_registered":
          message.channel.send(
            `You need to /register and track something to update product prices.`
          );
          break;
        case "name_missing":
          message.channel.send(
            "You need to provide a name for the product: /add {name}, {url}"
          );
          break;
        case "error":
          message.channel.send(`Something went wrong: ${result.error}`);
          break;
        default:
          assertUnreachable(result.state);
      }
    },

    // list tracked products, /list
    "/list": async () => {
      const result = await getProducts({
        client: dbClient,
        discordId: message.author.id,
      });

      switch (result.state) {
        case "success":
          if (result.products.length > 0) {
            const productsString = result.products
              .map(
                product => `${product.name}, ${product.price}, ${product.url}`
              )
              .join("\n");
            message.channel.send(`Your tracked products:\n ${productsString}`);
          } else {
            message.channel.send("You aren't tracking any products!");
          }
          break;
        case "not_registered":
          message.channel.send(
            `You need to /register and track something to list products.`
          );
          break;
        case "error":
          message.channel.send(`Something went wrong: ${result.error}`);
          break;
      }
    },
  }[command];

  // execute function
  if (func) {
    func();
  } else {
    console.error(`Command not found ${command}`);
  }
}

function parseMessage(message: string): [string, string | string[]] {
  const [command, ...rest] = message.split(" ");
  const tempParams = rest.join(" ").split(",");
  const params = tempParams.map(param => param.trim());
  return [command, params];
}
