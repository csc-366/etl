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
                    const observationId = await o.ingestObservation(observation);

                    const tags = await t.ingestTags(observation);
                    if (tags.length > 0) {
                        const newTags = tags.filter(({isNew}) => isNew);
                        const oldTags = tags.filter(({isNew}) => !isNew);

                        await t.ingestTagObservations(observation, observationId, oldTags);
                        await t.ingestTagDeployments(observation, observationId, newTags);

                        for (let i = 0; i < tags.length; i++) {
                            const {tagNum, isNew} = tags[i];
                            if (tagNum === 1 && isNew) {
                                await o.ingestSeal(observation, observationId)
                            }
                        }
                    }

                    const marks = await m.ingestMarks(observation);
                    if (marks.length > 0) {
                        const newMarks = marks.filter(({isNew}) => isNew);
                        const oldMarks = marks.filter(({isNew}) => !isNew);

                        await m.ingestMarkObservations(connection, observationId, oldMarks);
                        await m.ingestMarkDeployments(connection, observationId, newMarks);
                    }


                    await o.ingestMeasurement(observation, observationId);

                    await o.ingestFieldLeaders(observation, observationId);

                    await o.ingestPupAge(observation, observationId);

                    await o.ingestPupCount(observation, observationId);

                    await connection.query("COMMIT");
                    return null;
                }
                catch
                    (e) {
                    await connection.query('ROLLBACK');
                    throw e;
                }
                finally {
                    connection.release()
                }
            }
        )
        .filter(observation => observation);
}