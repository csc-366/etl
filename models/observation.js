import {format} from './db';

const insertAgeClasses = async (classes) => {
    const insertValues = classes.map(({shortName, fullName}) => {
        return format('(?,?)',[shortName,fullName]);
    }).join(',');
    query(`INSERT INTO AgeClass (ShortName, FullName) VALUES ${insertValues}`);
};

const ingestObservers = async (observers) => {
    const insertValues = observers.map(({email, firstName, lastName, affiliation}) => {
        return format('(?,?,?,?)',[email,firstName,lastName,affiliation]);
    }).join(',');
    query(`INSERT INTO Observer (Email, FirstName, LastName, Affiliation) VALUES ${insertValues}`);
};

export const ingestObservation = async ({date, location, reviewer, submittedBy, observer, ageClass, moltPercentage, comments, connection}) => {
    const q = format("INSERT INTO Observation (Date, Location, Reviewer, SubmittedBy, Observer, AgeClass, MoltPercentage, Comments) VALUES (?,?,?,?,?,?,?,?)",
        [date, location, reviewer, submittedBy, observer, ageClass, moltPercentage, comments]);
    await connection.query(q);
    const observation =
};

const ingestObservations = async (observations) => {
    const insertValues = observations.map(({date, location, reviewer, submittedBy, observer, ageClass, moltPercentage, comments}) => {
        return format('(?,?,?,?,?,?,?,?)',[date, location, reviewer, submittedBy, observer, ageClass, moltPercentage, comments])
    }).join(',');
    query(`INSERT INTO Observation (Date, Location, Reviewer, SubmittedBy, Observer, AgeClass, MoltPercentage, Comments) VALUES ${insertValues}`);
};

export const ingestPupCount = async (counts) => {
    const insertValues = counts.map(({observationId, count}) => {
        return format('(?,?)',[observationId,count])
    }).join(',');
    query(`INSERT INTO PupCount VALUES ${insertValues}`);
};

export const ingestPupAge = async (counts) => {
    const insertValues = counts.map(({observationId, age}) => {
        return format('(?,?)', [observationId, age]);
    }).join(',');
    query(`INSERT INTO PupAge (ObservationId, Age) VALUES ${insertValues}`)
};

export const ingestMeasurement = async (measurement) => {};

const ingestMeasurements = async (measurements) => {
    const insertValues = measurements.map(({observationId, standardLength, curvilinearLength, axillaryGirth, totalMass, massTare, animalMass}) => {
        return format('(?,?,?,?,?,?,?)', [observationId, standardLength, curvilinearLength, axillaryGirth, totalMass, massTare, animalMass])
    }).join(',');
    query(`INSERT INTO Measurement (ObservationId, StandardLength, CurvilinearLength, AxillaryGirth, TotalMass, MassTare, AnimalMass) VALUES ${insertValues}`);
};

export const ingestSeal = async (seal) => {

};

const ingestSeals = async (seals) => {
    const insertValues = seals.map(({firstObservation, sex, procedure}) => {
        return format(`(?,?,?)`, [firstObservation, sex, procedure])
    }).join(',')
    query(`INSERT INTO Seal (FirstObservation, Sex, Procedure) VALUES ${insertValues}`)
};

export const ingestFieldLeaders = async (fieldLeaders) => {
    const insertValues = fieldLeaders.map(({observationId, leader}) => {
        return format('(?,?)',[observationId, leader])
    }).join(',');
    query(`INSERT INTO FieldLeader (ObservationId, Leader) VALUES ${insertValues}`)
};
