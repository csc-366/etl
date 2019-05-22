import {format, query} from './db';
import {log} from '../utils/dump';

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

    return (await connection.query("SELECT LAST_INSERT_ID() as id"))[0][0].id
};

export const ingestPupCount = async ({pupCount, connection}, observationId) => {
    const q = format("INSERT INTO PupCount (ObservationId, Count) VALUES (?,?)", [observationId, pupCount]);
    if (pupCount !== null && !isNaN(pupCount)) {
        await query(connection, q);
    }
};

export const ingestPupAge = async ({age, connection}, observationId) => {
    const q = format("INSERT INTO PupAge (ObservationId, Age) VALUES (?,?)", [observationId, age]);
    if (age !== null && !isNaN(age)) {
        await query(connection, q);
    }
};

export const ingestMeasurement = async ({measurement, connection}, observationId) => {
    if (Object.values(measurement).filter(m => m).length > 0) {
        const {standardLength, curvilinearLength, axillaryGirth, totalMass, massTare, animalMass} = measurement;
        const q = format("INSERT INTO Measurement (ObservationId, StandardLength, CurvilinearLength, AxillaryGirth, TotalMass, MassTare, AnimalMass) VALUES (?,?,?,?,?,?,?)",
            [observationId, standardLength, curvilinearLength, axillaryGirth, totalMass, massTare, animalMass]);
        await query(connection, q);
    }
};

export const ingestSeal = async ({sex, procedure = null, connection}, observationId) => {
    const q = format("INSERT INTO Seal (FirstObservation, Sex, `Procedure`) VALUES (?,?,?)", [observationId, sex, procedure]);
    await query(connection, q);
};

export const ingestFieldLeaders = async ({fieldLeaders, connection}, observationId) => {
    if (fieldLeaders) {
        for (let i = 0; i < fieldLeaders.length; i++) {
            const leader = fieldLeaders[i];
            const q = format("INSERT INTO FieldLeader (ObservationId, Leader) VALUES (?,?)", [observationId, leader]);
            await query(connection, q);
        }
    }
};
