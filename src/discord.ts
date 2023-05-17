import Discord, { Client, Message } from "discord.js";
import {
  DBClient,
  addItem,
  removeItem,
  updateItem,
  getItems,
  register,
} from "./database/index.js";

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
      message.channel.send(`Created new user, hi ${result.discordname}!`);
    },

    // add product to track, /add {name}, {url}
    "/add": async () => {
      const result = await addItem({
        discordId: message.author.id,
        client: dbClient,
        name: params[0],
        url: params[1],
        price: "0",
      });
      console.log(result);
    },
    // remove product from tracking, /remove {name}
    "/remove": async () => {
      removeItem({ client: dbClient, name: params[0] });
    },
    // update product prices manually, /update
    "/update": async () => {
      updateItem({ client: dbClient, name: params[0], price: "0" });
    },
    // list tracked products, /list
    "/list": async () => {
      getItems();
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
