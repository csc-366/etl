import {query, format} from "./db";

export const ingestSeasons = async (seasons) => {
    const insertValues = seasons.map(({year, start, end, description}) => [year, start, end, description]);
    query("INSERT INTO Season (Year, Start, End, Description) VALUES ?", insertValues);
};

export const ingestMarks = async (marks) => {
    const insertValues = marks.map(({season, number, position}) => [season, number, position]);
    query("INSERT INTO Mark (Season, Number, Position) VALUES ?", insertValues);
};

export const ingestMarkDeployments = async (deployments) => {
    const insertValues = deployments.map(({observationId, markId}) => [observationId, markId]);
    query("INSERT INTO MarkDeployment (ObservationId, MarkId) VALUES ?", insertValues);
};

export const ingestMarkObservations = async (observations) => {
    const insertValues = observations.map(({observationId, markId}) => [observationId, markId]);
    query("INSERT INTO MarkObservation (ObservationId, MarkId) VALUES ?", insertValues);
};
