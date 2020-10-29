import {CommandoClient} from "discord.js-commando";
import {pool} from "../db/db";


export class MuteLoop {
    private client: CommandoClient;
    constructor(bot: CommandoClient) {
        this.client = bot;
    }

    public async run() {
        let res = await pool.query("SELECT * FROM anon_muting.users WHERE muted = true AND offence < 4");
        for (let i=0; i < res.rows.length; i++) {
            if (MuteLoop.canBeUnmuted(res.rows[i].offence, res.rows[i].muted_at)) {
                await pool.query("UPDATE anon_muting.users SET muted = false WHERE user_id = $1", [res.rows[i].user_id])
            }
        }
    }

    private static canBeUnmuted(offence: number, muted_at: Date) {
        let now = new Date();
        switch (offence) {
            case 1:
                let days_ago_7 = new Date().setDate(now.getDate() - 7)
                return (muted_at.getTime() <= days_ago_7);
            case 2:
                let days_ago_14 = new Date().setDate(now.getDate() - 14)
                return (muted_at.getTime() <= days_ago_14);
            case 3:
                let month_ago_1 = new Date().setMonth(now.getMonth() - 1)
                return (muted_at.getTime() <= month_ago_1);
            default:
                return false
        }
    }
}
