import * as commando from 'discord.js-commando';
import { CommandoClient, Command, CommandoMessage } from 'discord.js-commando';
import { GuildMember, Snowflake } from 'discord.js';
import * as utils from '../bot/utils';
import { pool } from '../../db/db';
import { checkIfUserMuted, getMuteReadableTime } from '../bot/utils';

// mute command
export = class MuteCommand extends commando.Command {
  // constructor for the command class where we define attributes used
  constructor(bot: CommandoClient) {
    super(bot, {
      name: 'mute',
      aliases: ['sm'],
      group: 'staff',
      memberName: 'suggestion mute',
      userPermissions: ['MANAGE_CHANNELS'],
      description: 'Mutes a user from suggestions',
      args: [
        {
          key: 'UserID',
          prompt: 'ID of a user that will be muted',
          type: 'string',
        },
      ],
      argsPromptLimit: 0,
      argsType: 'multiple',
      guildOnly: true,
    });
  }

  async run(msg: CommandoMessage, { UserID }: { UserID: string }) {
    const member = await utils.getMember(UserID, msg.guild);

    if (member === undefined) {
      return msg.reply('Please mention a valid member of this server');
    }

    if (await checkIfUserMuted(member.id)) {
      return msg.reply('User is already muted.');
    }

    const offence = await MuteCommand.mute(member);

    return msg.channel.send(`Suggestion Muted **${member.user.tag}** ${getMuteReadableTime(offence)}`);
  }

  public static async mute(member: GuildMember): Promise<number> {
    const res = await pool.query('SELECT * FROM anon_muting.users WHERE user_id = $1 LIMIT 1', [member.user.id]);

    const offence = res.rowCount === 0 ? 1 : res.rows[0].offence + 1;

    await pool.query(
      'INSERT INTO anon_muting.users (user_id, muted, offence, muted_at) \
            VALUES ($1, true, $2, now()) ON CONFLICT (user_id) DO UPDATE SET muted = true, offence = $2', [member.user.id, offence],
    );

    try {
      await member.send(`You have been Suggestion muted ${getMuteReadableTime(offence)}`);
    } catch (_) {
    }

    return offence;
  }
}
