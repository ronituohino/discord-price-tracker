import type { Channel } from "discord.js";

// Price are stored in the format {currencyFull (1+ numbers)},{currencyPartial (2 numbers)} {currencySign (€ or $)}
// eg. 423,90 € or 332,55 $ or 12313453,50 €
// Hopefully this makes sense lol
export function isCurrencyString(price: string): boolean {
  const re = new RegExp("^[0-9]+,[0-9]{2} [€$]$");
  return re.test(price);
}

// This turns currency strings into a comparable value
// eg. 42390 or 33255
export function string2int(price: string) {
  return parseInt(price.trim().split(" ")[0].replace(",", ""));
}

// Discord has a hard limit of 2000 chars per message
// This splits the message into multiple messages recursively to avoid that
export async function splitMessageSend(message: string, channel: Channel) {
  if (message.length > 2000) {
    const [first, second] = [message.slice(0, 2000), message.slice(2000)];
    // @ts-ignore
    await channel.send(first);
    await splitMessageSend(second, channel);
  } else {
    // @ts-ignore
    await channel.send(message);
  }
}
