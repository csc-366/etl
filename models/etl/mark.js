import {query, format} from "./db";
export const ingestSeasons = async (connection, seasons) => {
    const insertValues = seasons.map(({year, start, end, description}) => [year, start, end, description]);
    await query(connection, "INSERT INTO Season (Year, Start, End, Description) VALUES ?", insertValues);
};

export const ingestMarks = async ({year, marks, connection}) => {
    let insertedMarks = [];
    for (let i = 0; i < marks.length; i++) {
        const {mark, position, isNew, markNum} = marks[i];
        if (mark && mark.includes('_')) {
            throw new Error("Incomplete Mark")
        }
        const q = format("INSERT INTO Mark (Season, Number, Position) VALUES (?,?,?)", [year, mark, position]);
        try {
            await query(connection, q);
        } catch (e) {
            throw new Error("Invalid Mark Component(s)");
        }
        const id = (await query(connection, "SELECT LAST_INSERT_ID() as id"))[0].id;

        insertedMarks.push({
            isNew,
            id,
            markNum
        });
    }
    return insertedMarks
};

export const ingestMarkObservations = async ({connection, observationId}, marks) => {
    for (let i = 0; i < marks.length; i++) {
        const {id} = marks[i];
        const q = format("INSERT INTO MarkObservation (ObservationId, MarkId) VALUES (?,?)", [observationId, id]);
        await query(connection, q);
    }
};

export const ingestMarkDeployments = async ({connection, observationId, sealId}, marks) => {
    for (let i = 0; i < marks.length; i++) {
        const {id} = marks[i];
        const q = format("INSERT INTO MarkDeployment (ObservationId, MarkId, sealId) VALUES (?,?,?)", [observationId, id, sealId]);
        await query(connection, q);
    }
};
