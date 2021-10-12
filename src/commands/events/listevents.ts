import { CommandoClient, Command, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { pool } from '../../db/db';

export = class ListEvents extends Command {
  constructor(bot: CommandoClient) {
    super(bot, {
      name: 'list_events',
      aliases: ['lsevent', 'lsevents', 'listevents', 'listevent', 'list_event'],
      group: 'events',
      memberName: 'list events',
      userPermissions: ['MANAGE_CHANNELS'],
      description: 'List events for suggestions',
      guildOnly: true,
    });
  }

  async run(msg: CommandoMessage) {
    const results = await pool.query<{
      created_by: string;
      submissions_channel_id: string;
      review_channel_id: string;
      name: string;
      restriction: number;
      publish_reactions: string[];
    }>('SELECT created_by, submissions_channel_id, review_channel_id, name, restriction, publish_reactions FROM anon_muting.events WHERE active = true');
    const rows = results.rows;
    let lastReply: CommandoMessage | undefined;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const embed = new MessageEmbed();
      embed.setTitle(row.name);
      embed.addField("Submissions", `<#${row.submissions_channel_id}>`, true);
      embed.addField("Review", `<#${row.review_channel_id}>`, true);
      embed.addField("Created by", `<@${row.created_by}>`);
      switch (row.restriction) {
        default:
          embed.addField("Restrictions", `Unknown (${row.restriction})`);
          break;
        case 0:
          break;
        case 1:
          embed.addField("Restrictions", "Image only");
          break;
        case 2:
          embed.addField("Restrictions", "GIF/MP4 only");
          break;
        case 3:
          embed.addField("Restrictions", "Require attachment");
          break;
        case 4:
          embed.addField("Restrictions", "Text only");
          break;
      }
      const reactionList = row.publish_reactions;
      if (reactionList.length !== 0) {
        const formattedList = [];
        for (let i = 0; i < reactionList.length; i++) {
          const emote = reactionList[i];
          if (emote.length > 4) {
            formattedList.push(`<:reaction:${emote}>`);
          } else {
            formattedList.push(emote);
          }
        }
        embed.addField("Reactions", formattedList.join(' '));
      }
      lastReply = await msg.replyEmbed(embed);
    }
    if (lastReply === void 0) {
      return msg.reply("There are no active events");
    }
    return lastReply;
  }
}
