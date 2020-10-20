import * as commando from 'discord.js-commando';
import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import * as utils from "../bot/utils";
import { pool } from "../../db/db";

// mute command
export = class MuteCommand extends commando.Command {
    // constructor for the command class where we define attributes used
    constructor(bot: CommandoClient) {
        super(bot, {
            name: 'addsm',
            aliases: ['sm'],
            group: 'staff',
            memberName: 'suggestion mute',
            userPermissions: ['MANAGE_ROLES'],
            description: 'Give\'s a user the "Suggestion muted" role.',
            args: [
                {
                    key: 'UserID',
                    prompt: 'ID of a user that will be muted',
                    type: 'string'
                },
            ],
            argsPromptLimit: 0,
            argsType: 'multiple'
        });
    }

    // Function that executes when command is provided in chat
    async run(msg: CommandoMessage, { UserID }: { UserID: string }) {

        if (!msg.guild) {
            return msg.channel.send("Something went wrong!");
        }



        const SmuteRole = msg.guild.roles.cache.find(role => role.name == "Suggestionmuted");


        if (!SmuteRole) {
            return msg.say("Mute role does not exist!");
        }

        const member = await utils.getMember(UserID, msg.guild);

        if (member === undefined) {
            return msg.reply("Please mention a valid member of this server");
        }

        if (member.roles.cache.has(SmuteRole.id.toString())) {
            return msg.reply("User is already muted!");
        }

        let res = await pool.query("SELECT uid, offences FROM anon_muting.anon_users WHERE uid = $1 LIMIT 1", [member.user.id]);


        var offence = "first 7d"
        if (res.rows[0].offences === "first 7d")  offence = "second 14d"
        if (res.rows[0].offences === "second 14d")  offence = "third 1m"
        if (res.rows[0].offences === "third 1m")  offence = "fourth+ perma"

        // console.log(res)
        console.log(offence)

        if (res.rowCount === 0) {
            console.log("awadwacwaf")
            member.roles.add(SmuteRole.id.toString(), "Bad suggestion").then(async () => {
                await pool.query(
                    'INSERT INTO anon_muting.anon_users ('
                    + "uid,"
                    + 'created_at,'
                    + 'offences)'
                    + 'VALUES ($1, now(), $2)',
                    [
                        member.user.id,
                        offence
                    ],
                );
    
    
            })
                .catch(console.error);
        }else{
            member.roles.add(SmuteRole.id.toString(), "Bad suggestion").then(async () => {
                await pool.query(
                    'UPDATE anon_muting.anon_users SET'
                    + 'created_at = now(),'
                    + 'offences = $2'
                    + 'WHERE'
                    + 'uid = $1',
                    [
                        member.user.id,
                        offence
                    ],
                );
    
    
            })
                .catch(console.error);
        }




        msg.member.send("You have been Suggetion for `<time>` ")


        return msg.channel.send(`Suggetion Muted **${member.user.tag}**`)

    }
    // Function that executes if something blocked the exuction of the run function.
    // e.g. Insufficient permissions, throttling, nsfw, ...
    async onBlock(msg: CommandoMessage) {
        // Member that wanted to unmute didn't have enough perms to do it. Report
        // it back and delete message after a second.
        return (await msg.channel.send("Insufficient permissions to run this command."));/*.delete({timeout:utils.MILIS});/*/



    }
}
