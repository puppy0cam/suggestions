import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import * as utils from "../bot/utils";
import {checkIfUserMuted, getChannel, selectRestriction} from "../bot/utils";
import {pool} from "../../db/db";
import {MessageEmbed} from "discord.js";

export = class CreateEvent extends Command {
    constructor(bot: CommandoClient) {
        super(bot, {
            name: 'link_event',
            aliases: ['levent', 'event_link', 'lev', 'link'],
            group: 'events',
            memberName: 'link event',
            userPermissions: ['MANAGE_CHANNELS'],
            description: 'Link an event for submissions',
            args: [
                {
                    key: 'name',
                    prompt: 'The name for the event.',
                    type: 'string'
                },
                {
                    key: 'channel',
                    prompt: 'The channel I need to look on for this event.',
                    type: 'string'
                },
                {
                    key: 'review_channel',
                    prompt: 'The channel I need to send review requests in.',
                    type: 'string'
                },
            ],
            argsType:'multiple',
            guildOnly: true,
        });
    }

    async run(msg: CommandoMessage, {name, channel, review_channel}: {name: string, channel: string, review_channel: string}) {
        let restriction = await selectRestriction(msg);
        let Channel = await getChannel(channel, this.client);

        if (Channel == undefined) {
            return await msg.reply("Unable to locate that submission channel")
        }

        let reviewChannel = await getChannel(review_channel, this.client);

        if (reviewChannel == undefined) {
            return await msg.reply("Unable to locate that review channel")
        }

        await pool.query("INSERT INTO anon_muting.events (created_by, submissions_channel_id, review_channel_id, name, restriction) \
                                         VALUES ($1, $2, $3, $4, $5) \
                                         ON CONFLICT (submissions_channel_id) \
                                         DO UPDATE SET active = true, review_channel_id = $3, name = $4, restriction = $5",
            [msg.author.id, Channel.id, reviewChannel.id, name, restriction])

        return await msg.say("Linked!");
    }

    // Function that executes if something blocked the execution of the run function.
    // e.g. Insufficient permissions, throttling, nsfw, ...
    async onBlock(msg: CommandoMessage) {
        // Member that wanted to unmute didn't have enough perms to do it. Report
        // it back and delete message after a second.
        return (await msg.channel.send("Insufficient permissions to run this command."));/*.delete({timeout:utils.MILIS});/*/
    }
}
