import { CommandoClient } from 'discord.js-commando';
import { pool } from '../db/db';

export default class MuteLoop {
    private client: CommandoClient;

    constructor(bot: CommandoClient) {
      this.client = bot;
    }

    public async run() {
      const res = await pool.query('SELECT * FROM anon_muting.users WHERE muted = true AND offence < 4');
      for (let i = 0; i < res.rows.length; i++) {
        if (MuteLoop.canBeUnmuted(res.rows[i].offence, res.rows[i].muted_at)) {
          await pool.query('UPDATE anon_muting.users SET muted = false WHERE user_id = $1', [res.rows[i].user_id]);
        }
      }
    }

    private static canBeUnmuted(offence: number, mutedAt: Date) {
      const now = new Date();
      switch (offence) {
        case 1:
          const daysAgo7 = new Date().setDate(now.getDate() - 7);
          return (mutedAt.getTime() <= daysAgo7);
        case 2:
          const daysAgo14 = new Date().setDate(now.getDate() - 14);
          return (mutedAt.getTime() <= daysAgo14);
        case 3:
          const monthAgo = new Date().setMonth(now.getMonth() - 1);
          return (mutedAt.getTime() <= monthAgo);
        default:
          return false;
      }
    }
}
