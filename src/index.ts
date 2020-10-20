import { CommandoClient } from "discord.js-commando";
import path from "path";
import config from "./config/config.json";

// Create a new commando client with provided attributes
var bot: CommandoClient = new CommandoClient({
    commandPrefix: config.prefix,
    commandEditableDuration: 10,
    nonCommandEditable: false
});

// Register bot commands
bot.registry
    .registerGroups([
        ["public"],
        ["staff"],
        ["logs"]
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'commands'));

// Function that executes when bot is running. Calls the periodic function
// to check if there are any muted users.
bot.on("ready", async () => {
    if (bot.user === null) return
    console.log(`${bot.user.tag} is online!`);
    bot.user.setActivity('Ready to suggest mute people master!')
})

// login bot for given token
bot.login(config.token).catch(console.log);