import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import * as utils from "../bot/utils";
import {checkIfUserMuted, getChannel, getMember} from "../bot/utils";
import {pool} from "../../db/db";
import {MessageEmbed} from "discord.js";

export = class UserInfo extends Command {
    constructor(bot: CommandoClient) {
        super(bot, {
            name: 'userinfo',
            aliases: ['ui', 'about'],
            group: 'staff',
            memberName: 'userinfo',
            userPermissions: ['MANAGE_ROLES'],
            description: 'Get information about user',
            args: [
                {
                    key: 'userID',
                    prompt: 'The user you want to display',
                    type: 'string'
                },
            ],
            argsPromptLimit: 0,
            argsType:'multiple',
            guildOnly: true,
        });
    }

    async run(msg: CommandoMessage, {userID}: {userID: string}) {
        let member = await getMember(userID, msg.guild);

        if (member == undefined) {
            return await msg.reply("Unable to locate that user.")
        }

        let res = await pool.query("SELECT * FROM anon_muting.users WHERE user_id = $1", [member.id]);
        if (res.rowCount === 0) {
            return await msg.reply("Sorry, I don't have any information about that user.")
        }
        let user_db = res.rows[0];
        let embed = new MessageEmbed({
            author: {
                name: `${member.user.username}#${member.user.discriminator} (${member.id})`,
                iconURL: member.user.displayAvatarURL(),
            },
            description:
                `• Muted: **${UserInfo.makeBoolReadable(user_db.muted)}**
                 • Offence: **Lvl. ${user_db.offence}**`,
            color: "BLURPLE",
            footer: {
                text: `Requested by ${msg.author.username}#${msg.author.discriminator}`,
                iconURL: msg.author.displayAvatarURL(),
            },
            timestamp: new Date(),
        });

        return await msg.say(embed);
    }

    // Function that executes if something blocked the exuction of the run function.
    // e.g. Insufficient permissions, throttling, nsfw, ...
    async onBlock(msg: CommandoMessage) {
        // Member that wanted to unmute didn't have enough perms to do it. Report
        // it back and delete message after a second.
        return (await msg.channel.send("Insufficient permissions to run this command."));/*.delete({timeout:utils.MILIS});/*/
    }

    private static makeBoolReadable(i: boolean) {
        return i ? "Yes" : "No"
    }
}
