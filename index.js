import Discord from "discord.js";
import { fetchOlx } from "./fetchData.js";

const bot = new Discord.Client; // initialize the bot

// GLOBAL VARIABLES
const prefix = "!";
let currentOffer = "wacom"; // default value is "wacom"
let latestOffer = "";

bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.tag}!`);

    const channel = bot.channels.cache.get("833649510109544508");

    setInterval(async () => {
        try {
            if (currentOffer) {
                const { title, price, image, url } = await fetchOlx(`https://www.olx.pl/oferty/q-${currentOffer}/?search%5Border%5D=created_at%3Adesc`);

                if (title && url !== latestOffer) {
                    const offerEmbed = new Discord.MessageEmbed()
                        .setColor("#57E5DB")
                        .setTitle(title)
                        .setURL(url)
                        .setDescription(`**${price}**`)
                        .setThumbnail(image)

                    channel.send(offerEmbed);
                }
                
                latestOffer = url;
            }
        } catch (err) {
            console.log(err);
        }
    }, 5000);
})

bot.on("message", message => {
    if (message.author.bot) return;

    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        switch (command) {
            case "offer":
                if (args.length > 0) {
                    currentOffer = args;
                    message.channel.send(`New offer: ${currentOffer}`);
                }
                break;
            case "stop":
                currentOffer = "";
                message.channel.send(`Action has successfully stopped.`);
                break;
            case "latest":
                message.channel.send(latestOffer);
                break;
            default:
                message.channel.send("Command not found.")
                break;
        }
    }
})

bot.login(process.env.BOT_TOKEN); // login the bot
