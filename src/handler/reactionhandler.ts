import {MessageEmbed, MessageReaction, TextChannel, User} from "discord.js";
import {pool} from "../db/db";
import {CommandoClient} from "discord.js-commando";
import MuteCommand from '../commands/staff/suggestmute'

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

        switch (this.reaction.emoji.name) {
            case "👍":
                let image_url = embed.image
                embed.color = this.green;
                embed.title = "Approved";
                embed.setImage("attachment://file.jpg");
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
                submission_embed.setDescription(embed.description);
                submission_embed.image = image_url;
                submission_embed.author = {
                    name: "Submission",
                }
                await submissions_channel.send(submission_embed);

                approved = true;
                break;

            case "👎":
                embed.color = this.red
                embed.title = "Removed"
                embed.setImage("attachment://file.jpg");
                embed.footer = {
                    text: `Removed by ${this.user.username}#${this.user.discriminator}`,
                    iconURL: this.user.displayAvatarURL()
                }

                await this.reaction.message.edit(embed)

                approved = false;
                break;
            case "🔇":
                embed.color = this.purple;
                embed.title = "Removed & Muted";
                embed.setImage("attachment://file.jpg");
                embed.footer = {
                    text: `Removed by ${this.user.username}#${this.user.discriminator}`,
                    iconURL: this.user.displayAvatarURL(),
                };

                await this.reaction.message.edit(embed);
                await MuteCommand.mute(submission.rows[0].user_id);
                approved = false;
                break;
            default:
                return;
        }

        await pool.query("UPDATE anon_muting.submissions \
            SET approved = $1, reviewed_by = $2 \
            WHERE submission_id = $3", [approved, this.user.id, submission.rows[0].submission_id]);
    }
}
