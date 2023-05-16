import Discord from "discord.js";
import { DBClient, addItem, removeItem, updateItem, getItems } from "./db.js";

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

  client.on("messageCreate", msg => {
    if (msg.author.id != client.user.id) {
      if (msg.content.length > 0 && msg.content.startsWith("/")) {
        handleCommand(msg.content, dbClient);
      }
    }
  });

  client.login(token);
}

async function handleCommand(message: string, dbClient: DBClient) {
  const [command, params] = parseMessage(message);

  const func = {
    // add product to track, /add {name}, {url}
    "/add": () => {
      addItem({
        client: dbClient,
        name: params[0],
        url: params[1],
        price: "0",
      });
    },
    // remove product from tracking, /remove {name}
    "/remove": () => {
      removeItem({ client: dbClient, name: params[0] });
    },
    // update product prices manually, /update
    "/update": () => {
      updateItem({ client: dbClient, name: params[0], price: "0" });
    },
    // list tracked products, /list
    "/list": () => {
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
