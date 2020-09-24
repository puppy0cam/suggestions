import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import * as utils from "../bot/utils";

// mute command
export = class MuteCommand extends Command {
    // constructor for the command class where we define attributes used
    constructor(bot: CommandoClient) {
        super(bot, {
            name: 'removesm',
            aliases: ['rsm'],
            group: 'staff',
            memberName: 'suggestion unmute',
            userPermissions: ['MANAGE_ROLES'],
            description: 'Remove\'s a user from the "Suggestion muted role".',
            args: [
                {
                    key: 'UserID',
                    prompt: 'ID of a user that will be muted',
                    type: 'string'
                },
            ],
            argsPromptLimit: 0,
            argsType:'multiple'
        });
    }

    // Function that executes when command is provided in chat
    async run(msg: CommandoMessage, {UserID}: {UserID: string}) {

        if (!msg.guild) {
            return msg.channel.send("Something went wrong!");
        }



        const SmuteRole = msg.guild.roles.cache.find(role => role.name == "Suggestionmuted");


        if(!SmuteRole) {
            return msg.say("Mute role does not exist!");
        }

        const member = await utils.getMember(UserID, msg.guild);

        if (member === undefined) {
            return msg.reply("Please mention a valid member of this server");
        }


        if (!member.roles.cache.has(SmuteRole.id.toString())) {
            return msg.reply("User is not muted!");
        }



        member.roles.remove(SmuteRole, "They good boyo now!")



    return msg.channel.send(`Suggetion Unmuted **${member.user.tag}**`)
        
    }
    // Function that executes if something blocked the exuction of the run function.
    // e.g. Insufficient permissions, throttling, nsfw, ...
    async onBlock(msg: CommandoMessage) {
        // Member that wanted to unmute didn't have enough perms to do it. Report
        // it back and delete message after a second.
        return (await msg.channel.send("Insufficient permissions to run this command."));/*.delete({timeout:utils.MILIS});/*/
        
    
    
    }
}
