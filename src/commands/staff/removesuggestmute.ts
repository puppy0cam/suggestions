import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import * as utils from "../bot/utils";
import {checkIfUserMuted} from "../bot/utils";
import {pool} from "../../db/db";

// mute command
export = class UnMuteCommand extends Command {
    // constructor for the command class where we define attributes used
    constructor(bot: CommandoClient) {
        super(bot, {
            name: 'unmute',
            aliases: ['rsm'],
            group: 'staff',
            memberName: 'suggestion unmute',
            userPermissions: ['MANAGE_ROLES'],
            description: 'Unmute a user from suggestions',
            args: [
                {
                    key: 'UserID',
                    prompt: 'ID of a user that will be muted',
                    type: 'string'
                },
            ],
            argsPromptLimit: 0,
            argsType:'multiple',
            guildOnly: true,
        });
    }

    // Function that executes when command is provided in chat
    async run(msg: CommandoMessage, {UserID}: {UserID: string}) {
        const muteRole = msg.guild.roles.cache.find(role => role.name == "Suggestionmuted");

        const member = await utils.getMember(UserID, msg.guild);

        if (member === undefined) {
            return await msg.reply("Please mention a valid member of this server");
        }

        if (!await checkIfUserMuted(member.id)) {
            return await msg.reply("User is not muted!");
        }

        await pool.query("UPDATE anon_muting.users SET muted = false WHERE user_id = $1", [member.id])

        return await msg.say(`Unmuted **${member.user.tag}**`)

    }
    // Function that executes if something blocked the execution of the run function.
    // e.g. Insufficient permissions, throttling, nsfw, ...
    async onBlock(msg: CommandoMessage) {
        // Member that wanted to unmute didn't have enough perms to do it. Report
        // it back and delete message after a second.
        return (await msg.channel.send("Insufficient permissions to run this command."));/*.delete({timeout:utils.MILIS});/*/



    }
}
