import {query, format} from "./db";

export const ingestSeasons = async (seasons) => {
    const insertValues = seasons.map(({year, start, end, description}) => [year, start, end, description]);
    query("INSERT INTO Season (Year, Start, End, Description) VALUES ?", insertValues);
};

export const ingestMarks = async ({year, marks, connection}) => {
    let insertedMarks = [];
    for (let i = 0; i < marks.length; i++) {
        const {mark, position, isNew, markNum} = marks[i];
        const q = format("INSERT INTO Mark (Season, Number, Position) VALUES (?,?,?)", [year, mark, position]);
        await connection.query(q);
        const id = (await connection.query("SELECT LAST_INSERT_ID() as id"))[0][0].id;

        insertedMarks.push({
            isNew,
            id,
            markNum
        });
    }
    return insertedMarks
};

export const ingestMarkObservations = async (connection, observationId, marks) => {
    for (let i = 0; i < marks.length; i++) {
        const {id} = marks[i];
        const q = format("INSERT INTO MarkObservation (ObservationId, MarkId) VALUES (?,?)", [observationId,id]);
        await connection.query(q);
    }
};

export const ingestMarkDeployments = async (connection, observationId, marks) => {
    for (let i = 0; i < marks.length; i++) {
        const {id} = marks[i];
        const q = format("INSERT INTO MarkDeployment (ObservationId, MarkId) VALUES (?,?)", [observationId,id]);
        await connection.query(q);
    }
};
