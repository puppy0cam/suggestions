import { Pool, PoolClient } from 'pg';
import {loadConfig} from "../config/config";
import * as fs from "fs";

let config = loadConfig();

// Create a new pool for db access.
// Database information is given in the config file.
// Export pool so it can be used in other files
export const pool = new Pool({
    host: config.database.host,
    database: config.database.database,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
});

const sql = fs.readFileSync("pg.sql").toString();

// Create a connection for the pool so schema and table can be created and used
// by the bot.
pool.connect((err?: Error, client?: PoolClient, rel?: (_?: any) => void) => {
    if (err) {
        return console.error('Error acquiring client', err.stack)
    }
    // if error is undefiend then client is not.
    client = client as PoolClient

    let errHandle = (err?: Error) => {
        if (err) {
            return console.error('Error executing query', err.stack);
        }
    };

    client.query(sql, errHandle);
});

