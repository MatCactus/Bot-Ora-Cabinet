import * as Discord from "discord.js";
import { data } from "./utils/dbFileManager";
require("dotenv").config();
require("./utils/dbFileManager");

import * as fs from "fs";

export const client = new Discord.Client({
    intents: [
        "GUILDS",
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_REACTIONS",
        "DIRECT_MESSAGE_TYPING",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "DIRECT_MESSAGE_REACTIONS",
    ],
    partials: [
        "CHANNEL", // Required to receive DMs
    ],
});

client.once("ready", async () => {
    console.log(`Client logged as ${client.user?.tag}`);
    client.user?.setPresence({
        activities: [
            {
                name: "Des questions ? Je suis là !",
                type: "WATCHING",
            },
        ],
    });

    const modules = await fs.promises.readdir(`${__dirname}/modules`);
    modules.forEach(e => {
        require(`${__dirname}/modules/${e}`);
        console.log(`Module ${e} Loaded.`);
    });
    console.log("I'm ready to be Abused");
});

client.login(process.env.TOKEN);
