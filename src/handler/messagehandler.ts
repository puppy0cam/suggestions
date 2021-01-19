import {FileOptions, Message, MessageAttachment, MessageEmbed, TextChannel} from "discord.js";
import {pool} from "../db/db";
import {checkIfUserMuted, getFileExtension} from "../commands/bot/utils";
import {CommandoClient} from "discord.js-commando";

const request = require('request').defaults({encoding: null});

export default class MessageHandler {
    private readonly msg: Message;
    private client: CommandoClient;
    constructor(message: Message, client: CommandoClient) {
        this.msg = message;
        this.client = client
        this.handleSubmission().then(_ => _)
    }

    private async handleSubmission() {
        let event = await pool.query("SELECT * FROM anon_muting.events WHERE submissions_channel_id = $1 AND active = true", [this.msg.channel.id])
        if (event.rowCount === 0) return // Return if channel not in database

        let DMChannel = await this.msg.author.createDM();

        if (await checkIfUserMuted(this.msg.author.id)) {
            return await this.msg.delete();
        }

        let channel = (await this.client.channels.fetch(event.rows[0].review_channel_id, true, true)) as TextChannel;
        let embed = new MessageEmbed({
            title: 'Submission review',
            timestamp: new Date(),
            description: this.msg.content,
            author: {
                name: `${this.msg.author.username}#${this.msg.author.discriminator}`,
                iconURL: this.msg.author.displayAvatarURL(),
            },
            footer: {
                text: `Event: ${event.rows[0].name}`
            },
            color: "BLURPLE",
        });

        let attachment = this.msg.attachments.first()
        let img;

        if (attachment != undefined) {
            if (event.rows[0].restriction === 4) {
                await this.msg.delete();
                return await DMChannel.send("Sorry, this event is text only. No attachments allowed");
            }

            img = await new Promise((resolve, reject) => {
                // @ts-ignore
                request.get(attachment.url, async function (err: any, res: any, body: Buffer) {
                    if (body != undefined) {
                        resolve(body)
                    }
                })
            });
        } else {
            if (![0, 4].includes(event.rows[0].restriction)) {
                await this.msg.delete();
                return await DMChannel.send("Sorry, this event requires an attachment.");
            }
        }

        if (img != undefined) {
            // @ts-ignore
            const ext = getFileExtension(attachment.name)
            if (!MessageHandler.checkIfExtValid(ext.trim(), event.rows[0].restriction)) {
                await this.msg.delete();
                return await DMChannel.send("Sorry, that file extension is not allowed in the current event.\n" +
                    "If it does follow the rules try formatting it to a common extension like png or mp4");
            }
            embed.files = [new MessageAttachment((img) as Buffer, `file.${ext}`)]
            embed.setImage(`attachment://file.${ext}`)
        }

        let review_msg = await channel.send(embed);

        await this.msg.delete();

        try {
            await DMChannel.send("Thanks for submitting! Your post is currently in review and will show up shortly");
        } catch (_) {

        }

        await review_msg.react('👍')
        await review_msg.react('👎')
        await review_msg.react('🔇')

        await pool.query("INSERT INTO anon_muting.submissions \
            (user_id, review_message_id, event_id) VALUES \
            ($1, $2, $3)", [this.msg.author.id, review_msg.id, event.rows[0].event_id])
    }

    private static checkIfExtValid(extension: string, restriction: number): boolean {
        // 0: No restrictions
        // 1: image only
        // 2: gif/video only
        // 3: mp4/gif/image only
        // 4: text only

        switch (restriction) {
            case 0:
                return true;
            case 1:
                return (/\.|jpe?g|tiff?|png|webp|bmp$/i).test(extension);
            case 2:
                return (/\.|gif|mp4|mov|wmv|flv$/i).test(extension);
            case 3:
                return (/\.|gif|mp4|mov|wmv|flv|jpe?g|tiff?|png|webp|bmp$/i).test(extension);
            default:
                return false
        }
    }
}
