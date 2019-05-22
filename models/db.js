import mysql from 'mysql2/promise';
import 'dotenv/config';
import * as util from 'util';

import * as l from './location';
import * as m from './mark';
import * as o from './observation';
import * as t from './tag';
import * as u from './user';
import {log, setOutputFileName} from "../utils/dump";

const {DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE} = process.env;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
});

export const query = async (connection, q, params) => {
    try {
        const result = await connection.query(q, params);
        if (process.env.ENABLE_LOGS) {
            await log(`SUCCESS: ${q}`);
        }
        return result;
    } catch (e) {
        if (process.env.ENABLE_LOGS) {
            await log(`FAILURE: ${q}`, error=true);
        }
        throw e;
    }
};

//export const query = util.promisify(pool.query).bind(pool);
export const format = mysql.format;

export async function ingest(data) {
    setOutputFileName(`./log/${new Date().toISOString()}.log.txt`);
    let errors = {};
    for (let i = 0; i < data.length; i++) {
        let observation = data[i];
        const connection = await pool.getConnection();
        await connection.query("START TRANSACTION");

        observation = {...observation, connection};

        if (!observation.date || !observation.location) {
            errors[observation.rowNumber] = "Date and Location are required fields."
        }

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
        }
        catch
            (e) {
            await query(connection, 'ROLLBACK');
            await query(connection,`INSERT INTO PendingObservations (FieldLeaders, Year, Date, Location, Sex, Age, PupCount, NewMark1, Mark1, Mark1Position, NewMark2, Mark2, Mark2Position, NewTag1, Tag1Number, Tag1Position, NewTag2, Tag2Number, Tag2Position, MoltPercentage, Season, StandardLength, CurvilinearLength, AxillaryGirth, Mass, Tare, AnimalMass, LastSeenAsPup, FirstSeenAsWeanling, \`Range\`, Comments, EnteredInAno) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    observation.fieldLeaders ? observation.fieldLeaders.join(',') : null,
                    observation.year,
                    observation.date,
                    observation.location,
                    observation.sex,
                    observation.age,
                    isNaN(observation.pupCount) ? null : observation.pupCount,
                    observation.marks[0] ? observation.marks[0].isNew : null,
                    observation.marks[0] ? observation.marks[0].number : null,
                    observation.marks[0] ? observation.marks[0].position : null,
                    observation.marks[1] ? observation.marks[1].isNew : null,
                    observation.marks[1] ? observation.marks[1].number : null,
                    observation.marks[1] ? observation.marks[1].position : null,
                    observation.tags[0] ? observation.tags[0].isNew : null,
                    (observation.tags[0] && observation.tags[0].color && observation.tags[0].number) ? `${observation.tags[0].color}${observation.tags[0].number}` : null,
                    observation.tags[0] ? observation.tags[0].position : null,
                    observation.tags[1] ? observation.tags[1].isNew : null,
                    (observation.tags[1] && observation.tags[1].color && observation.tags[1].number) ? `${observation.tags[1].color}${observation.tags[1].number}` : null,
                    observation.tags[1] ? observation.tags[1].position : null,
                    observation.moltPercentage,
                    observation.season,
                    observation.standardLength,
                    observation.curvilinearLength,
                    observation.axillaryGirth,
                    observation.mass,
                    observation.tare,
                    observation.animalMass,
                    observation.lastSeenAsPup,
                    observation.firstSeenAsWeanling,
                    observation.range,
                    observation.comments,
                    observation.enteredInAno
                ]);
            errors[observation.rowNumber] = e.message;
        }
        finally {
            connection.release();
        }
    }
    return errors;
}