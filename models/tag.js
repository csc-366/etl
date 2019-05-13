import {query, format} from "./db";

export const TAG_COLOR_REGEX = /[WBGPVRYO]/;
export const VALID_TAG_POS_CHARS = 'RLSouil-_';

export const ingestTagPositions = async (positions) => {
    const insertValues = positions.map(({position, nationalTagPosition}) => [position, nationalTagPosition]);
    query("INSERT INTO TagPosition (Position, NationalTagPosition) VALUES ?", insertValues);
};

export const ingestTagColors = async (colors) => {
    const insertValues = colors.map(({color, nationalTagColor, colorName}) => [color, nationalTagColor, colorName]);
    query("INSERT INTO TagColor(Color, NationalTagColor, ColorName) VALUES ?", insertValues);
};

export const ingestTags = async ({tags}) => {
    const insertValues = tags.map(({tag, position}) => {
        const [, color, number] = TAG_REGEX.exec(tag);
        return format("(?,?,?)", [number, color, position]);
    }).join(',');
    if (insertValues.length === 0)
        return;

    insertValues.forEach(tag => {
        if (!TAG_COLOR_REGEX.test(tag.color)) {
            throw new Error("Bad color")
        }
    });

    insertValues.forEach(tag => {
       for (let i = 0; i < tag.position.length; i++) {
          if (!VALID_TAG_POS_CHARS.includes(tag.position[i])) {
              throw new Error("Bad tag")
          }
       }
    });

    try {
        const q = `INSERT INTO Tag (Number, Color, Position) VALUES ${insertValues}`;
        await query(q);
        return insertValues.map(tag => {
            return tag.number;
        });
    } catch (e) {
        console.error(e.message)
    }
};

export const ingestTag = async ({number, color, position}) => {
    if (!TAG_COLOR_REGEX.test(color)) {
        throw new Error( "Bad color")
    }
    for (let i = 0; i < position.length; i++) {
       if (!VALID_TAG_POS_CHARS.includes(position[i])) {
           throw new Error("Bad tag")
       }
    }
    const q = format("INSERT INTO Tag (Number, Color, Position) VALUES (?,?,?)", [number, color, position]);
    const result = await query(q);
    return (await connection.query("SELECT LAST_INSERT_ID() as ID"))[0][0].ID;
};

export const ingestTagDeployments = async (deployments) => {
    const insertValues = deployments.map(({observationId, tagNumber}) => [observationId, tagNumber]);
    query("INSERT INTO TagDeployment (ObservationId, TagNumber) VALUES ?", insertValues);
};

export const ingestTagObservations = async (observations) => {
    const insertValues = observations.map(({observationId, tagNumber}) => [observationId, tagNumber]);
    query("INSERT INTO TagObservation (ObservationId, TagNumber) VALUES ?", insertValues)
};
