import {MessageAttachment, MessageEmbed, MessageEmbedImage, MessageReaction, TextChannel, User} from "discord.js";
import {pool} from "../db/db";
import {CommandoClient} from "discord.js-commando";
import MuteCommand from '../commands/staff/suggestmute'
import {getFileExtension, getMember, getMuteReadableTime} from "../commands/bot/utils";

export default class ReactionHandler {
    private readonly reaction: MessageReaction;
    private client: CommandoClient;
    private user: User;
    private readonly red: number;
    private readonly green: number;
    private readonly purple: number;

    constructor(Reaction: MessageReaction, User: User, client: CommandoClient) {
        this.reaction = Reaction;
        this.client = client
        this.user = User
        this.red = 0xff0000
        this.green = 0x008000
        this.purple = 0x9400D3
        this.handleSubmissionReview().then(_ => _)
    }

    private async handleSubmissionReview() {
        let submission = await pool.query(
            "SELECT e.submissions_channel_id, submission_id, user_id FROM anon_muting.submissions \
            INNER JOIN anon_muting.events e on e.event_id = submissions.event_id \
            WHERE submissions.review_message_id = $1 AND e.review_channel_id = $2", [this.reaction.message.id, this.reaction.message.channel.id])
        if (submission.rowCount === 0 || this.reaction.message.author != this.client.user) return

        let embed = this.reaction.message.embeds[0];
        let approved: boolean;

        let image_url: MessageEmbedImage;
        if (embed.image != undefined) {
            let file = (embed.image) as MessageEmbedImage;
            // @ts-ignore
            let ext = getFileExtension(file.url);
            image_url = embed.image;
            embed.setImage(`attachment://file.${ext}`);
        }

        switch (this.reaction.emoji.name) {
            case "👍":
                embed.color = this.green;
                embed.title = "Approved";
                embed.footer = {
                    text: `Approved by ${this.user.username}#${this.user.discriminator}`,
                    iconURL: this.user.displayAvatarURL()
                };

                await this.reaction.message.edit(embed);

                let submissions_channel = (await this.client.channels.fetch(submission.rows[0].submissions_channel_id, true, true)) as TextChannel;

                let submission_embed = new MessageEmbed({
                    timestamp: new Date(),
                    color: "BLURPLE"
                });
                if (embed.description != null) {
                    submission_embed.setDescription(embed.description);
                }

                // @ts-ignore
                submission_embed.image = image_url;
                submission_embed.author = {
                    name: "Submission",
                }
                await submissions_channel.send(submission_embed);

                approved = true;
                break;

            case "👎":
                embed.files.pop();
                embed.color = this.red
                embed.title = "Removed"
                embed.footer = {
                    text: `Removed by ${this.user.username}#${this.user.discriminator}`,
                    iconURL: this.user.displayAvatarURL()
                }

                await this.reaction.message.edit(embed)

                approved = false;
                break;
            case "🔇":
                // @ts-ignore
                let member = await getMember(submission.rows[0].user_id, this.reaction.message.guild);
                if (member === undefined) {
                    await this.reaction.message.channel.send("Something went wrong. Please contact my dad");
                    return
                }

                let offence = await MuteCommand.mute(member);

                embed.files.pop();
                embed.title = "Removed & Muted " + getMuteReadableTime(offence);
                embed.color = this.purple;
                embed.footer = {
                    text: `Removed by ${this.user.username}#${this.user.discriminator}`,
                    iconURL: this.user.displayAvatarURL(),
                };

                await this.reaction.message.edit(embed);

                approved = false;
                break;
            default:
                return;
        }

        await this.reaction.message.reactions.removeAll();

        await pool.query("UPDATE anon_muting.submissions \
            SET approved = $1, reviewed_by = $2 \
            WHERE submission_id = $3", [approved, this.user.id, submission.rows[0].submission_id]);
    }
}
