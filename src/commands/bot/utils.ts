import * as discord from "discord.js";


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
        let member = await guild.members.fetch(uidParsed);
        return member;
    } catch(e) {
        console.log(`User not found because ${e}`);
        return undefined;
    }
}