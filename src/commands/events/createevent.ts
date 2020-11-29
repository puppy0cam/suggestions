// import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
// import * as utils from "../bot/utils";
// import {checkIfUserMuted, getChannel, selectRestriction} from "../bot/utils";
// import {pool} from "../../db/db";
// import {MessageEmbed} from "discord.js";
//
// export = class CreateEvent extends Command {
//     constructor(bot: CommandoClient) {
//         super(bot, {
//             name: 'create_event',
//             aliases: ['cevent', 'event_create', 'cev'],
//             group: 'events',
//             memberName: 'create event',
//             userPermissions: ['MANAGE_ROLES'],
//             description: 'Create an event for submissions',
//             args: [
//                 {
//                     key: 'Name',
//                     prompt: 'The name for the event.',
//                     type: 'string'
//                 }
//             ],
//             argsType:'multiple',
//             guildOnly: true,
//         });
//     }
//
//     public async run(msg: CommandoMessage, {Name}: {Name: string}) {
//         let restriction = await selectRestriction(msg);
//         await pool.query("INSERT INTO anon_muting.events (created_by, submissions_channel_id, review_channel_id, name, restriction) \
//                                          VALUES ($1, $2, $3, $4, $5) \
//                                          ON CONFLICT (submissions_channel_id) \
//                                          DO UPDATE SET active = true, review_channel_id = $3, name = $4",
//             [msg.author.id, this.channel.id, reviewChannel.id, name, restriction])
//
//         return await msg.say(restriction.toString());
//     }
//
//     // Function that executes if something blocked the execution of the run function.
//     // e.g. Insufficient permissions, throttling, nsfw, ...
//     async onBlock(msg: CommandoMessage) {
//         // Member that wanted to unmute didn't have enough perms to do it. Report
//         // it back and delete message after a second.
//         return (await msg.channel.send("Insufficient permissions to run this command."));/*.delete({timeout:utils.MILIS});/*/
//     }
// }
