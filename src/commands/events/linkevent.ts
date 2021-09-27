import { CommandoClient, Command, CommandoMessage } from 'discord.js-commando';
import { getChannel, selectRestriction } from '../bot/utils';
import { pool } from '../../db/db';

export = class CreateEvent extends Command {
  constructor(bot: CommandoClient) {
    super(bot, {
      name: 'link_event',
      aliases: ['levent', 'event_link', 'lev', 'link'],
      group: 'events',
      memberName: 'link event',
      userPermissions: ['MANAGE_CHANNELS'],
      description: 'Link an event for submissions',
      args: [
        {
          key: 'name',
          prompt: 'The name for the event.',
          type: 'string',
        },
        {
          key: 'channel',
          prompt: 'The channel I need to look on for this event.',
          type: 'string',
        },
        {
          key: 'reviewChannel',
          prompt: 'The channel I need to send review requests in.',
          type: 'string',
        },
      ],
      argsType: 'multiple',
      guildOnly: true,
    });
  }

  async run(msg: CommandoMessage, { name, channel, reviewChannel }: {name: string, channel: string, reviewChannel: string}) {
    const restriction = await selectRestriction(msg);
    const Channel = await getChannel(channel, this.client);

    if (Channel === undefined) {
      return msg.reply('Unable to locate that submission channel');
    }

    const reviewChannelFetched = await getChannel(reviewChannel, this.client);

    if (reviewChannelFetched === undefined) {
      return msg.reply('Unable to locate that review channel');
    }

    await pool.query('INSERT INTO anon_muting.events (created_by, submissions_channel_id, review_channel_id, name, restriction) \
                                         VALUES ($1, $2, $3, $4, $5) \
                                         ON CONFLICT (submissions_channel_id) \
                                         DO UPDATE SET active = true, review_channel_id = $3, name = $4, restriction = $5',
    [msg.author.id, Channel.id, reviewChannelFetched.id, name, restriction]);

    return msg.say('Linked!');
  }
}
