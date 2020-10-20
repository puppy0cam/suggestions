import { Pool, PoolClient } from 'pg';
import {config} from "../index"

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

// Create a connection for the pool so schema and table can be created and used
// by the bot.
pool.connect((err?: Error, client?: PoolClient, rel?: (_?: any) => void) => {
    if (err) {
        return console.error('Error acquiring client', err.stack)
    }
    // if error is undefiend then client is not.
    client = client as PoolClient

    client.query('CREATE SCHEMA IF NOT EXISTS anon_muting;', (err) => {
        if (err) {
            return console.error('Error executing query', err.stack);
        }
    });

    let errHandle = (err?: Error) => {
        if (err) {
            return console.error('Error executing query', err.stack);
        }
    };

    client.query(
        'CREATE TABLE IF NOT EXISTS anon_muting.users (' +
            + 'uid bigint,'
            + 'offences text,'
            + 'created_at timestamp)',
            errHandle
    );
});
