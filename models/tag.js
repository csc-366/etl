import {format} from "./db";
import {query} from "./db";

const TAG_REGEX = /([WBGPVRYO])(.+)/;
const COMPLETE_TAG_REGEX = /([WBGPVRYO])([^_]+)/;
const TAG_POSITION_REGEX = /(?:R|L)(?:[1-4])-s(?:i|o)/;
const NATIONAL_TAG_POSITION_REGEX = /(?:L|R)-(?:i|o)(?:l|u)-S(?:i|o)/;

export const ingestTagPositions = async (connection, positions) => {
    const insertValues = positions.map(({position, nationalTagPosition}) => [position, nationalTagPosition]);
    await query(connection, "INSERT INTO TagPosition (Position, NationalTagPosition) VALUES ?", insertValues);
};

export const ingestTagColors = async (connection, colors) => {
    const insertValues = colors.map(({color, nationalTagColor, colorName}) => [color, nationalTagColor, colorName]);
    await query(connection, "INSERT INTO TagColor(Color, NationalTagColor, ColorName) VALUES ?", insertValues);
};

export const ingestTags = async ({tags, connection}) => {
    let insertedTags = [];
    for (let i = 0; i < tags.length; i++) {
        let {tag, position, isNew, tagNum} = tags[i];
        if (!TAG_REGEX.test(tag)) {
            continue;
        } else if (!TAG_POSITION_REGEX.test(position) && NATIONAL_TAG_POSITION_REGEX.test(position)) {
            position = (await query(connection, "SELECT Position FROM TagPosition WHERE NationalTagPosition=? LIMIT 1", [position]))[0].Position;
        } else if (!COMPLETE_TAG_REGEX.test(tag)) {
            throw new Error("Incomplete Tag")
        }

        const {color, number} = tag;
        try {
            await query(connection,"INSERT INTO Tag (Number, Color, Position) VALUES (?,?,?)", [number, color, position]);
        } catch (e) {
            throw new Error("Invalid Tag Component(s)");
        }
        const id = (await query(connection, "SELECT LAST_INSERT_ID() as id"))[0].id;

        insertedTags.push({
            isNew, id: number, tagNum
        })
    }
    return insertedTags
};

export const ingestTagDeployments = async ({connection, observationId, sealId}, tags) => {
    for (let i = 0; i < tags.length; i++) {
        const {id} = tags[i];
        const q = format("INSERT INTO TagDeployment (ObservationId, TagNumber, SealId) VALUES (?,?,?)", [observationId, id, sealId]);
        await query(connection, q);
    }
};

export const ingestTagObservations = async ({connection, observationId}, tags) => {
    for (let i = 0; i < tags.length; i++) {
        const {id} = tags[i];
        const q = format("INSERT INTO TagObservation (ObservationId, TagNumber) VALUES (?,?)", [observationId, id]);
        await query(connection, q);
    }
};
