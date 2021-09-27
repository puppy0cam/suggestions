import { CommandoClient } from 'discord.js-commando';
import path from 'path';
import { MessageReaction, User } from 'discord.js';
import { loadConfig } from './config/config';
import MessageHandler from './handler/messagehandler';
import ReactionHandler from './handler/reactionhandler';
import MuteLoop from './loops/muteloop';

export const config = loadConfig();

// Create a new commando client with provided attributes
const bot: CommandoClient = new CommandoClient({
  commandPrefix: config.prefix,
  commandEditableDuration: 10,
  nonCommandEditable: false,
});

// Register bot commands
bot.registry
  .registerGroups([
    ['public'],
    ['staff'],
    ['logs'],
    ['events'],
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'));

// Function that executes when bot is running. Calls the periodic function
// to check if there are any muted users.
bot.on('ready', async () => {
  if (bot.user === null) return;
  console.log(`${bot.user.tag} is online!`);
  await bot.user.setActivity('your submissions', { type: 'WATCHING' });

  const muteloop = new MuteLoop(bot);
  setInterval(() => {
    muteloop.run().then((_) => _);
  }, 300000); // 5 Minutes (300000)
});

bot.on('message', async (msg) => {
  if (msg.author === bot.user) return;
  new MessageHandler(msg, bot);
});

bot.on('messageReactionAdd', async (reaction: MessageReaction, user) => {
  if (user === bot.user) return;
  new ReactionHandler(reaction, user as User, bot);
});

// login bot for given token
bot.login(config.token).catch(console.log);
