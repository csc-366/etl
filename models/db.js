import mysql from 'mysql';
import 'dotenv/config';
import * as util from 'util';

import * as l from './location';
import * as m from './mark';
import * as o from './observation';
import * as t from './tag';
import * as u from './user';

const {DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE} = process.env;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
});

export const query = util.promisify(pool.query).bind(pool);
export const format = mysql.format;

export async function ingest(data) {
    data.forEach(async (observation) => {
        const observation = await o.ingestObservation(observation);
        const tags = await t.ingestTags(observation)
    });
}