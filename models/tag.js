import {format} from "./db";

export const TAG_REGEX = /([WBGPVRYO])(.+)/;
export const TAG_POSITION_REGEX = /[RLSouil\-_0-9]+/;

export const ingestTagPositions = async (positions) => {
    const insertValues = positions.map(({position, nationalTagPosition}) => [position, nationalTagPosition]);
    query("INSERT INTO TagPosition (Position, NationalTagPosition) VALUES ?", insertValues);
};

export const ingestTagColors = async (colors) => {
    const insertValues = colors.map(({color, nationalTagColor, colorName}) => [color, nationalTagColor, colorName]);
    query("INSERT INTO TagColor(Color, NationalTagColor, ColorName) VALUES ?", insertValues);
};

export const ingestTags = async ({tags, connection}) => {
    let insertedTags = [];
    for (let i = 0; i < tags.length; i++ ) {
        const {tag, position, isNew, tagNum} = tags[i];
        if (!TAG_REGEX.test(tag)) {
            continue;
        } else if (!TAG_POSITION_REGEX.test(position)) {
            continue;
        }

        const {color, number} = tag;
        const q = format("INSERT INTO Tag (Number, Color, Position) VALUES (?,?,?)", [number, color, position]);
        try {
            await connection.query(q);
        } catch (e) {
            continue
        }
        const id = (await connection.query("SELECT LAST_INSERT_ID() as id"))[0][0].id;

        insertedTags.push({
            isNew, id:number,tagNum
        })
    }
    return insertedTags
};

export const ingestTagDeployments = async ({connection}, observationId, tags) => {
    for (let i = 0; i < tags.length; i++) {
        const {id} = tags[i];
        const q = format("INSERT INTO TagDeployment (ObservationId, TagNumber) VALUES (?,?)", [observationId,id]);
        await connection.query(q);
    }
};

export const ingestTagObservations = async ({connection}, observationId, tags) => {
    for (let i = 0; i < tags.length; i++) {
        const {id} = tags[i];
        const q = format("INSERT INTO TagObservation (ObservationId, TagNumber) VALUES (?,?)", [observationId,id]);
        await connection.query(q);
    }
};
