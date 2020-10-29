import * as discord from "discord.js";
import {DMChannel, Message} from "discord.js";
import {pool} from "../../db/db";
import exp from "constants";
import {CommandoClient} from "discord.js-commando";


export async function getMember(uid: string, guild: discord.Guild) {
    let uidParsed = uid;
    // Check if user was tagged or not. If the user was tagged remove the
    // tag from id.
    if (uid.startsWith('<@') && uid.endsWith('>')) {
        let re = new RegExp('[<@!>]', 'g');
        uidParsed = uid.replace(re, '');
    }
    // Try recovering the user and report if it was successful or not.
    try {
        return await guild.members.fetch(uidParsed);
    } catch(e) {
        console.log(`User not found because ${e}`);
        return undefined;
    }
}

export async function getChannel(uid: string, client: CommandoClient) {
    let uidParsed = uid;
    // Check if user was tagged or not. If the user was tagged remove the
    // tag from id.
    if (uid.startsWith('<#') && uid.endsWith('>')) {
        let re = new RegExp('[<#!>]', 'g');
        uidParsed = uid.replace(re, '');
    }
    // Try recovering the user and report if it was successful or not.
    try {
        return await client.channels.fetch(uidParsed, true, true);
    } catch(e) {
        console.log(`User not found because ${e}`);
        return undefined;
    }
}

// export async function selectAnon(msg: Message, channel: DMChannel) {
//     let embed = new discord.MessageEmbed()
//     embed.title = "Hello Gamers";
//     let embedMsg = await channel.send(embed);
//     await embedMsg.react('👍')
//     let collected = await embedMsg.awaitReactions((reaction, user) => {return ['👍'].includes(reaction.emoji.name) && user.id === msg.author.id},
//         {max: 1, time: 60000, errors: ['time']})
//
//     const reaction = collected.first();
//     if (reaction == undefined) {
//         console.error("How tf did you get here")
//         return
//     }
//
//     switch (reaction.emoji.name) {
//         case '👍':
//             return true
//         case '👎':
//             return false
//         default:
//             await channel.send("Wrong emote smh my head");
//             return false
//     }
// }

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function checkIfUserMuted(user_id: string) {
    let res = await pool.query("SELECT * FROM anon_muting.users WHERE user_id = $1", [user_id])
    return !(res.rowCount === 0 || !res.rows[0].muted);
}

export function getMuteReadableTime(offence: number) {
    switch (offence) {
        case 1:
            return "for 7 days";
        case 2:
            return "for 14 days";
        case 3:
            return "for 1 month";
        default:
            return "permanently"
    }
}

export function getFileExtension(filename: string) {
    return filename.substr(filename.lastIndexOf('.')+1);
}
