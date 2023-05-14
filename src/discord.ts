import Discord from "discord.js";

type Params = {
  token: string;
};

export function startClient({ token }: Params) {
  const client = new Discord.Client({
    intents: ["Guilds", "GuildMessages", "MessageContent"],
  });

  client.on("ready", () => {
    console.log("I'm in");
    console.log(client.user.username);
  });

  client.on("messageCreate", msg => {
    if (msg.author.id != client.user.id) {
      if (msg.content.length > 0 && msg.content.startsWith("/")) {
        msg.channel.send(msg.content.split("").reverse().join(""));
      }
    }
  });

  client.login(token);
  return client;
}
