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

//export const query = util.promisify(pool.query).bind(pool);
export const format = mysql.format;

export async function ingest(data) {
    data
        .map(async (observation) => {
            const connection = await pool.getConnection();
            await connection.query("START TRANSACTION");

            observation = {...observation, connection};

            try {
                // Returns {observationId}
                const observationId = await o.ingestObservation(observation);

                /*
                // Returns [{tagId}]
                const tags = await t.ingestTags(observation);
                const newTags = tags.filter(({isNew}) => isNew);
                const oldTags = tags.filter(({isNew}) => !isNew);

                await t.ingestTagObservations(observation, obs, oldTags);
                await t.ingestTagDeployments(observation, obs, newTags);
                */

                const marks = await m.ingestMarks(observation);
                if (marks.length > 0) {
                    const newMarks = marks.filter(({isNew}) => isNew);
                    const oldMarks = marks.filter(({isNew}) => !isNew);

                    await m.ingestMarkObservations(connection, observationId, oldMarks);
                    await m.ingestMarkDeployments(connection, observationId, newMarks);
                }

                //await o.ingestSeal(observation, observationId);

                await o.ingestMeasurement(observation, observationId);

                await o.ingestFieldLeaders(observation, observationId);

                await o.ingestPupAge(observation, observationId);

                //await o.ingestPupCount(observation, obs);

                await connection.query("COMMIT");
                return null;
            } catch (e) {
                await connection.query('ROLLBACK');
                console.error(e.message);
                return e.message;
            } finally {
                connection.release()
            }
        })
        .filter(observation => observation);
}