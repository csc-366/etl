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

export const pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
});

export const query = async (connection, q, params) => {
    try {
        const [rows,] = await connection.query(q, params);
        if (process.env.ENABLE_LOGS === 'true') {
            await log(`SUCCESS: ${q}`);
        }
        return rows;
    } catch (e) {
        if (process.env.ENABLE_LOGS === 'true') {
            await log(`FAILURE: ${q}`);
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
        await query(connection, "START TRANSACTION");

        observation = {...observation, connection};

        if (!observation.date || !observation.location) {
            errors[observation.rowNumber] = "Date and Location are required fields."
        }

        try {
            const observationId = await o.ingestObservation(observation);

            const sealId = await o.ingestSeal(observation, observationId);

            observation = {...observation, observationId, sealId};

            await o.ingestSealObservation(observation);

            const tags = await t.ingestTags(observation);
            if (tags.length > 0) {
                const newTags = tags.filter(({isNew}) => isNew);
                const oldTags = tags.filter(({isNew}) => !isNew);

                await t.ingestTagObservations(observation, oldTags);
                await t.ingestTagDeployments(observation, newTags);
            }

            const marks = await m.ingestMarks(observation);
            if (marks.length > 0) {
                const newMarks = marks.filter(({isNew}) => isNew);
                const oldMarks = marks.filter(({isNew}) => !isNew);

                await m.ingestMarkObservations(observation, oldMarks);
                await m.ingestMarkDeployments(observation, newMarks);
            }

            await o.ingestMeasurement(observation);

            await o.ingestFieldLeaders(observation);

            await o.ingestPupAge(observation);

            await o.ingestPupCount(observation);

            await connection.query("COMMIT");
        }
        catch
            (e) {
            console.error(e.stack);
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