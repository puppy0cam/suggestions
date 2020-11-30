import * as commando from 'discord.js-commando';
import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import * as utils from "../bot/utils";
import { pool } from "../../db/db";
import {checkIfUserMuted, getMuteReadableTime} from "../bot/utils";
import {Snowflake} from "discord.js";

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
                    type: 'string'
                }
            ],
            argsPromptLimit: 0,
            argsType: 'multiple',
            guildOnly: true,
        });
    }

    // Function that executes when command is provided in chat
    async run(msg: CommandoMessage, { UserID }: { UserID: string }) {
        const member = await utils.getMember(UserID, msg.guild);

        if (member === undefined) {
            return await msg.reply("Please mention a valid member of this server");
        }

        if (await checkIfUserMuted(member.id)) {
            return await msg.reply("User is already muted.")
        }

        let offence = await MuteCommand.mute(member.user.id)

        await member.send(`You have been Suggestion muted ${getMuteReadableTime(offence)}`)

        return await msg.channel.send(`Suggestion Muted **${member.user.tag}** ${getMuteReadableTime(offence)}`)
    }

    // Function that executes if something blocked the execution of the run function.
    // e.g. Insufficient permissions, throttling, nsfw, ...
    async onBlock(msg: CommandoMessage) {
        // Member that wanted to unmute didn't have enough perms to do it. Report
        // it back and delete message after a second.
        return (await msg.channel.send("Insufficient permissions to run this command."));
    }

    public static async mute(user_id: Snowflake): Promise<number> {
        let res = await pool.query("SELECT * FROM anon_muting.users WHERE user_id = $1 LIMIT 1", [user_id]);

        let offence = res.rowCount === 0 ? 1 : res.rows[0].offence + 1

        await pool.query(
            "INSERT INTO anon_muting.users (user_id, muted, offence, muted_at) \
            VALUES ($1, true, $2, now()) ON CONFLICT (user_id) DO UPDATE SET muted = true, offence = $2", [user_id, offence])

        return offence
    }
}
