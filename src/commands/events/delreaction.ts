import { CommandoClient, Command, CommandoMessage } from 'discord.js-commando';
import { GuildEmoji } from 'discord.js';
import { pool } from '../../db/db';

export = class DelReaction extends Command {
  constructor(bot: CommandoClient) {
    super(bot, {
      name: 'del_reaction',
      aliases: ['dreact', 'del_react', 'delreaction', 'delreact'],
      group: 'events',
      memberName: 'delete reaction',
      userPermissions: ['MANAGE_CHANNELS'],
      description: 'Remove an emote from being automatically added as a reaction to approved submissions',
      args: [
        {
          key: 'name',
          prompt: 'The name of the event',
          type: 'string',
        },
        {
          key: 'emoji',
          prompt: 'The emote to apply to no longer apply to the approved submission',
          type: 'custom-emoji|default-emoji',
        },
      ],
      argsType: 'multiple',
      guildOnly: true,
    });
  }

  async run(msg: CommandoMessage, { name, emoji }: { name: string, emoji: string | GuildEmoji}) {
    let action: string;
    if (typeof emoji === 'string') {
      action = emoji;
    } else if (emoji instanceof GuildEmoji) {
      if (!emoji.available) {
        return msg.reply('This emoji is not available');
      }
      action = emoji.id;
    } else {
      return msg.reply('Emote was not in a recognised form');
    }
    const result = await pool.query('UPDATE anon_muting.events\
                                      SET publish_reactions = array_remove( publish_reactions, $1 )\
                                      WHERE\
                                        name = $2\
                                        AND $1 = ANY ( publish_reactions ) RETURNING event_id',
      [action, name]);
    if (result.rowCount) {
      return msg.reply('Removed this emote from the reaction list');
    } else {
      return msg.reply('Either the selected event does not exist, or this emote wasn\'t on the reaction list in the first place');
    }
  }
}
