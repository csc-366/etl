import mysql from 'mysql2/promise';
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
    data
        .map(async (observation) => {
            const connection = await pool.acquireConnection();
            await connection.query("START TRANSACTION");

            observation = {...observation, connection};

            try {
                // Returns {observationId}
                const obs = await o.ingestObservation(observation);

                // Returns [{tagId}]
                const tags = await t.ingestTags(observation);
                const newTags = tags.filter(({isNew}) => isNew);
                const oldTags = tags.filter(({isNew}) => !isNew);

                await t.ingestTagObservations(observation, obs, oldTags);
                await t.ingestTagDeployments(observation, obs, newTags);

                // Returns [{markId}]
                const marks = await m.ingestMarks(observation);
                const newMarks = marks.filter(({isNew}) => isNew);
                const oldMarks = marks.filter(({isNew}) => !isNew);

                await m.ingestMarkObservations(observation, obs, newMarks);
                await m.ingestMarkDeployments(observation, obs, oldMarks);

                await o.ingestSeal(observation, obs);

                await o.ingestMeasurement(observation, obs);

                await o.ingestFieldLeaders(observation, obs);

                await o.ingestPupAge(observation, obs);

                await o.ingestPupCount(observation, obs);

                await connection.query("COMMIT");
                return null;
            } catch (e) {
                await connection.query('ROLLBACK');
                return e.message;
            } finally {
                connection.release()
            }

        })
        .filter(observation => observation);
}