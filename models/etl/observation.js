import {format, query} from './db';
import {log} from '../../utils/dump';

const insertAgeClasses = async (connection, classes) => {
    const insertValues = classes.map(({shortName, fullName}) => {
        return format('(?,?)', [shortName, fullName]);
    }).join(',');
    await query(connection, `INSERT INTO AgeClass (ShortName, FullName) VALUES ${insertValues}`);
};

const ingestObservers = async (connection, observers) => {
    const insertValues = observers.map(({email, firstName, lastName, affiliation}) => {
        return format('(?,?,?,?)', [email, firstName, lastName, affiliation]);
    }).join(',');
    await query(connection, `INSERT INTO Observer (Email, FirstName, LastName, Affiliation) VALUES ${insertValues}`);
};

export const ingestObservation = async ({date, location, reviewer, submittedBy, observer, age, moltPercentage, comments, connection}) => {
    if (age) {
        age = age.trim();
        if (!isNaN(age)) {
            age = 'P'
        }
    }
    location = (location === 'ALLN') ? 'ALLn' : location;
    location = (location === 'ALLS') ? 'ALLs' : location;

    const q = format("INSERT INTO Observation (Date, Location, Reviewer, SubmittedBy, Observer, AgeClass, MoltPercentage, Comments) VALUES (?,?,?,?,?,?,?,?)",
        [date, location, reviewer, submittedBy, observer, age, moltPercentage, comments]);
    await query(connection, q);

    return (await query(connection, "SELECT LAST_INSERT_ID() as id"))[0].id
};

export const ingestPupCount = async ({pupCount, connection, observationId}) => {
    if (pupCount !== null && !isNaN(pupCount)) {
        await query(connection,"INSERT INTO PupCount (ObservationId, Count) VALUES (?,?)", [observationId, pupCount]);
    }
};

export const ingestPupAge = async ({age, connection, observationId}) => {
    if (age !== null && !isNaN(age)) {
        await query(connection, "INSERT INTO PupAge (ObservationId, Age) VALUES (?,?)", [observationId, age]);
    }
};

export const ingestMeasurement = async ({measurement, connection, observationId}) => {
    if (Object.values(measurement).filter(m => m).length > 0) {
        const {standardLength, curvilinearLength, axillaryGirth, totalMass, massTare, animalMass} = measurement;
        const q = format("INSERT INTO Measurement (ObservationId, StandardLength, CurvilinearLength, AxillaryGirth, TotalMass, MassTare, AnimalMass) VALUES (?,?,?,?,?,?,?)",
            [observationId, standardLength, curvilinearLength, axillaryGirth, totalMass, massTare, animalMass]);
        await query(connection, q);
    }
};

export const ingestSealObservation = async ({connection, sealId, observationId}) => {
    await query(connection, "INSERT INTO SealObservation (ObservationId, SealId) VALUES (?,?)", [observationId, sealId])
};

export const ingestSeal = async ({sex, procedure = null, marks, tags, year, connection}, observationId) => {
    for (let i = 0; i < tags.length; i++) {
        const {tagNum, isNew} = tags[i];
        if (tagNum === 1 && isNew) {
            await query(connection,"INSERT INTO Seal (FirstObservation, Sex, `Procedure`) VALUES (?,?,?)", [observationId, sex, procedure]);
            return (await query(connection, "SELECT LAST_INSERT_ID() as id"))[0].id;
        }
    }
    for (let i = 0; i < tags.length; i++) {
        if (tags[i].tag) {
            const {isNew, tag: {number}} = tags[i];
            if (!isNew && number) {
                const results = (await query(connection, "SELECT SealId FROM TagDeployment WHERE TagNumber=? LIMIT 1", [number]))[0];
                console.log(results);
                if (results) {
                    return results.SealId;
                }
            }
        }
    }
    for (let i = 0; i < marks.length; i++) {
        const {isNew, mark} = marks[i];
        if (!isNew && mark) {
            const markIds = (await query(connection, "SELECT ID FROM Mark WHERE Season=? AND Number=?", [year, mark]));
            let markId = (markIds.length > 0) ? markIds[0].ID : null;

            if (markId) {
                const results = (await query(connection, "SELECT SealId from MarkDeployment WHERE MarkId=? LIMIT 1", [markId]))[0];
                if (results) {
                    return results.SealId;
                }
            }
        }
    }
    await query(connection, "INSERT INTO Seal (FirstObservation, Sex, `Procedure`) VALUES (?,?,?)", [observationId, sex, procedure]);
    return (await query(connection, "SELECT LAST_INSERT_ID() as id"))[0].id
};

export const ingestFieldLeaders = async ({fieldLeaders, connection, observationId}) => {
    if (fieldLeaders) {
        for (let i = 0; i < fieldLeaders.length; i++) {
            const leader = fieldLeaders[i];
            const q = format("INSERT INTO FieldLeader (ObservationId, Leader) VALUES (?,?)", [observationId, leader]);
            await query(connection, q);
        }
    }
};
