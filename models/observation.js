import {format} from './db';

const insertAgeClasses = async (classes) => {
    const insertValues = classes.map(({shortName, fullName}) => {
        return format('(?,?)', [shortName, fullName]);
    }).join(',');
    query(`INSERT INTO AgeClass (ShortName, FullName) VALUES ${insertValues}`);
};

const ingestObservers = async (observers) => {
    const insertValues = observers.map(({email, firstName, lastName, affiliation}) => {
        return format('(?,?,?,?)', [email, firstName, lastName, affiliation]);
    }).join(',');
    query(`INSERT INTO Observer (Email, FirstName, LastName, Affiliation) VALUES ${insertValues}`);
};

export const ingestObservation = async ({date, location, reviewer, submittedBy, observer, age, moltPercentage, comments, connection}) => {
    if (age) {
        age = age.trim();
        if (!isNaN(age)) {
            age = 'P'
        }
    }
    const q = format("INSERT INTO Observation (Date, Location, Reviewer, SubmittedBy, Observer, AgeClass, MoltPercentage, Comments) VALUES (?,?,?,?,?,?,?,?)",
        [date, location, reviewer, submittedBy, observer, age, moltPercentage, comments]);
    try {
        await connection.query(q);
    } catch (e) {
        console.log(`Could not insert Observation (${date},${location},${reviewer},${submittedBy},${observer},${age},${moltPercentage},${comments})\n\t${e.message}`)
    }

    return (await connection.query("SELECT LAST_INSERT_ID() as id"))[0][0].id
};

export const ingestPupCount = async ({pupCount, connection}, observationId) => {
    if (pupCount !== null && !isNaN(pupCount)) {
        const q = format("INSERT INTO PupCount (ObservationId, Count) VALUES (?,?)", [observationId, pupCount]);
        await connection.query(q);
    }
};

export const ingestPupAge = async ({age, connection}, observationId) => {
    if (age !== null && !isNaN(age)) {
        const q = format("INSERT INTO PupAge (ObservationId, Age) VALUES (?,?)", [observationId, age]);
        await connection.query(q);
    }
};

export const ingestMeasurement = async ({measurement, connection}, observationId) => {
    if (Object.values(measurement).filter(m => m).length > 0) {
        const {standardLength, curvilinearLength, axillaryGirth, totalMass, massTare, animalMass} = measurement;
        const q = format("INSERT INTO Measurement (ObservationId, StandardLength, CurvilinearLength, AxillaryGirth, TotalMass, MassTare, AnimalMass) VALUES (?,?,?,?,?,?,?)",
            [observationId, standardLength, curvilinearLength, axillaryGirth, totalMass, massTare, animalMass]);
        try {
            await connection.query(q)
        } catch (e) {
            console.log(`Could not insert Measurement (${observationId},measurements)\n\t${e.message}`)
        }
    }
};

export const ingestSeal = async ({sex, procedure = null, connection}, observationId) => {
    const q = format("INSERT INTO Seal (FirstObservation, Sex, `Procedure`) VALUES (?,?,?)", [observationId, sex, procedure]);
    await connection.query(q);
};

export const ingestFieldLeaders = async ({fieldLeaders, connection}, observationId) => {
    if (fieldLeaders) {
        for (let i = 0; i < fieldLeaders.length; i++) {
            const leader = fieldLeaders[i];
            const q = format("INSERT INTO FieldLeader (ObservationId, Leader) VALUES (?,?)", [observationId, leader]);
            try {
                await connection.query(q);
            } catch (e) {
                const observation = await connection.query("SELECT * FROM Observation WHERE ID = ?", [observationId]);
                console.log(`Could not insert FieldLeader (${observationId},${leader})\n\t${e.message}`)
            }
        }
    }
};
