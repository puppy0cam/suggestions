import { CommandoClient, Command, CommandoMessage } from 'discord.js-commando';
import { getChannel } from '../bot/utils';
import { pool } from '../../db/db';

export = class CreateEvent extends Command {
  constructor(bot: CommandoClient) {
    super(bot, {
      name: 'stop_event',
      aliases: ['sevent', 'event_stop', 'sev', 'delete_event', 'devent', 'event_delete', 'dev', 'clear'],
      group: 'events',
      memberName: 'stop event',
      userPermissions: ['MANAGE_CHANNELS'],
      description: 'Stop event for submissions',
      args: [
        {
          key: 'channel',
          prompt: 'The channel which I should stop looking in for submissions. (Can be a mention of either the submission channel or the review channel',
          type: 'string',
        },
      ],
      argsType: 'multiple',
      guildOnly: true,
    });
  }

  async run(msg: CommandoMessage, { channel }: {channel: string}) {
    const Channel = await getChannel(channel, this.client);

    if (Channel === undefined) {
      return msg.reply('Unable to locate that channel');
    }

    await pool.query('UPDATE anon_muting.events SET active = false WHERE submissions_channel_id = $1 OR review_channel_id = $1', [Channel.id]);

    return msg.say('I will stop looking in those channels!');
  }
}
