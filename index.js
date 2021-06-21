import Discord from "discord.js";
import { fetchOlx } from "./fetchData.js";

// Initialize the bot
const bot = new Discord.Client();

// GLOBAL VARIABLES
const prefix = "!";
let currentOffer = "wacom"; // default value is "wacom"
let latestOfferArr = []; // using an array because there is some bug with just a string comparison

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);

  // Channel where the bot will be sending offers
  const channel = bot.channels.cache.get("833649510109544508");

  // Fast interval function because I want to get notified quite rapidly
  setInterval(async () => {
    // If there is no any currentOffer set, do nothing
    if (!currentOffer) return;

    // Try to fetch the latest possible offer from the OLX listing
    const { title, price, image, url } = await fetchOlx(
      `https://www.olx.pl/oferty/q-${currentOffer}/?search%5Border%5D=created_at%3Adesc`
    );

    // If there is no any offer (just check a title, because it is enough) or the offer array includes fetched url, do nothing
    if (!title || latestOfferArr.includes(url)) return;

    // Create Discord embed to beautify an output
    const offerEmbed = new Discord.MessageEmbed()
      .setColor("#57E5DB")
      .setTitle(title)
      .setURL(url)
      .setDescription(`**${price}**`)
      .setThumbnail(image);

    // Send an output to the server
    channel.send(offerEmbed);

    // Add an url of a new offer to the array to prevent from repetition
    latestOfferArr.push(url);
  }, 3000);
});

bot.on("message", message => {
  // If a message has been sent by the bot or starts without the prefix, do nothing
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  // Format arguments
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Using a switch statement for optimizing purposes
  switch (command) {
    case "offer":
      if (args.length <= 0) return; // if there are no any arguments, do nothing

      currentOffer = args; // assign an argument value with an offer to the global variable
      message.channel.send(`New offer: ${currentOffer}`);
      break;
    case "stop":
      currentOffer = "";
      message.channel.send(`Action has successfully stopped.`);
      break;
    case "latest":
      message.channel.send(latestOffer);
      break;
    default:
      message.channel.send("Command not found.");
      break;
  }
});

bot.login(process.env.BOT_TOKEN); // login the bot
