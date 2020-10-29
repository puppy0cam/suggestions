import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import * as utils from "../bot/utils";
import {checkIfUserMuted, getChannel} from "../bot/utils";
import {pool} from "../../db/db";

export = class CreateEvent extends Command {
    constructor(bot: CommandoClient) {
        super(bot, {
            name: 'stop_event',
            aliases: ['sevent', 'event_stop', 'sev', 'delete_event', 'devent', 'event_delete', 'dev', 'clear'],
            group: 'events',
            memberName: 'stop event',
            userPermissions: ['MANAGE_ROLES'],
            description: 'Stop event for submissions',
            args: [
                {
                    key: 'channel',
                    prompt: 'The channel which I should stop looking in for submissions. (Can be a mention of either the submission channel or the review channel',
                    type: 'string'
                },
            ],
            argsType:'multiple',
            guildOnly: true,
        });
    }

    async run(msg: CommandoMessage, {channel}: {channel: string}) {
        let Channel = await getChannel(channel, this.client);

        if (Channel == undefined) {
            return await msg.reply("Unable to locate that channel")
        }

        await pool.query("UPDATE anon_muting.events SET active = false WHERE submissions_channel_id = $1 OR review_channel_id = $1", [Channel.id])

        return await msg.say("I will stop looking in those channels!");
    }
    // Function that executes if something blocked the execution of the run function.
    // e.g. Insufficient permissions, throttling, nsfw, ...
    async onBlock(msg: CommandoMessage) {
        // Member that wanted to unmute didn't have enough perms to do it. Report
        // it back and delete message after a second.
        return (await msg.channel.send("Insufficient permissions to run this command."));/*.delete({timeout:utils.MILIS});/*/



    }
}
