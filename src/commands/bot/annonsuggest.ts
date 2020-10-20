
import { DMChannel, TextChannel, Client } from "discord.js";
import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import * as utils from "../bot/utils";

// mute command
export = class Suggest extends Command {
    // constructor for the command class where we define attributes used
    constructor(bot: CommandoClient) {
        super(bot, {
            name: 'suggest',
            aliases: ['s'],
            group: 'public',
            memberName: 'suggest',
            userPermissions: ['SEND_MESSAGES'],
            description: 'Lets a user suggest something.',
            args: [
                {
                    key: 'Type',
                    prompt: 'The suggest type the user wants to make',
                    type: 'string'
                },
                {
                    key: 'Suggestion',
                    prompt: 'The suggestion the user makes',
                    type: 'string'
                },
            ],
            argsPromptLimit: 0,
            argsType: 'multiple'
        });
    }

    // Function that executes when command is provided in chat
    async run(msg: CommandoMessage, { Type, Suggestion }: { Type: string, Suggestion: string }) {

        //if channel is not a dm delete so it stays anonymous
        if (msg.channel.type != "dm") {
            msg.delete()
        }



        const server = this.client.guilds.cache.find(guild => guild.id === "738771970665218181")

        if (!server) {
            return msg.author.send("Server don't exist? please contact staff immediately!!")
        }

        const member = server.members.cache.find(member => member.user.id === msg.author.id)

        if (!member) {
            return msg.author.send("You don't exist? please contact staff immediately!!")
        }


        if (member.roles.cache.has("758461243752579123")) {
            return msg.author.send("You are suggestion muted so you cannot make any suggestions!")
        }


        // if (!Type) return msg.author.send("Please suggest towards one of the 3 types \n **Minecraft**, **Server**, **Event**\nUsage: `suggest <type> <suggestion>` Example: `suggest Minecraft Shop system?")


        switch (Type) {

            case "Minecraft".toLowerCase(): {
                let mc = msg.client.channels.cache.get("758483345910530088")
                if (!mc) {
                    return msg.author.send("Channel does't exist, please report this to a member of staff!")
                }
                (mc as TextChannel).send(Suggestion)

                break;
            }

            case "Server".toLowerCase(): {
                const server = msg.client.channels.cache.get("758483368114782209")
                if (!server) {
                    return msg.author.send("Channel does't exist, please report this to a member of staff!")
                }
                (server as TextChannel).send(Suggestion)

                break;
            }


            case "Event".toLowerCase(): {
                const event = msg.client.channels.cache.get("758483386468925441")
                if (!event) {
                    return msg.author.send("Channel does't exist, please report this to a member of staff!")
                }
                (event as TextChannel).send(Suggestion)

                break;
            }
            default: {
                msg.author.send("Please suggest towards one of the 3 types \n **Minecraft**, **Server**, **Event**\nUsage: `suggest <type> <suggestion>` Example: `suggest Minecraft Shop system?")
            }
        }






        return msg.author.send(`Suggetion Unmuted **${msg.author.tag}**`)

    }
    // Function that executes if something blocked the exuction of the run function.
    // e.g. Insufficient permissions, throttling, nsfw, ...
    async onBlock(msg: CommandoMessage) {
        // Member that wanted to unmute didn't have enough perms to do it. Report
        // it back and delete message after a second.
        return (await msg.channel.send("Insufficient permissions to run this command."));/*.delete({timeout:utils.MILIS});/*/



    }
}
