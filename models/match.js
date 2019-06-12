import {format, query} from "./db2";

export const match = async ()

export const matchSex = async (sex) => {
    if (!sex) {
        return {}
    }

    const dbResult = (await query(format("SELECT FirstObservation FROM Seal WHERE Sex = ?", [sex])))[0]
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: 1}), {});

    // {}
    // { 1: 1 }
    // { 1: 1, 2: 1 }
    // { 1: 1, 2: 1, 3: 1 }

    return dbResult;
};

export const matchMarks = async (marks) => {
    const markNumberMatches = {};
    const markPositionMatches = {};

    return Object.entries(markNumberMatches).reduce((agg, [sealId, score]) => {
        return {
            ...agg,
            [sealId]: score + (markPositionMatches[sealId] ? markPositionMatches[sealId] : 0)
        }
    }, {})
};

const matchMarkNumbers = async (markNumbers) => {

};

const matchMarkPosition = async (markPositions) => {

};

export const matchTags = async (tags) => {
    if (!tags) {
        return {};
    }

    const scoreLists = [];

    for (let i = 0; i < tags.length; i++) {
        const currentTag = tags[i];
        const tagNumberScores = matchTagNumber(currentTag.number);
        const tagPositionScores = matchTagPosition(currentTag.position);
        const tagColorScores = matchTagColor(currentTag.color);

        const tagScores = Object.entries(tagNumberScores).reduce((agg, [sealId, score]) => {
            return {
                ...agg,
                [sealId]: score +
                (tagPositionScores[sealId] ? tagPositionScores[sealId] : 0) +
                (tagColorScores[sealId] ? tagColorScores[sealId] : 0)
            }
        }, {});

        scoreLists.push(tagScores);
    }


    const scores = aggregateScoreLists(scoreLists);
    return scores;
};

const matchTagNumber = async (number) => {
    if (!number || typeof number !== 'string') {
        return {};
    }

    let score = (number.includes('_')) ? 4 : 8;


    const dbResponse = (await query(format("SELECT *\n" +
        "FROM Tag t\n" +
        "       LEFT JOIN TagDeployment td on t.Number = td.TagNumber\n" +
        "       LEFT JOIN Seal s on td.SealId = s.FirstObservation\n" +
        "WHERE Number LIKE ?", [number])))[0]
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: score}), {});

    return dbResponse;
};

const matchTagPosition = async (position) => {
    if (!position || typeof position !== 'string') {
        return {};
    }

    let score = (position.includes('_')) ? 1 : 2;

    const dbResponse = (await query(format("SELECT *\n" +
        "FROM Tag t\n" +
        "       LEFT JOIN TagDeployment td on t.Number = td.TagNumber\n" +
        "       LEFT JOIN Seal s on td.SealId = s.FirstObservation\n" +
        "WHERE Position LIKE ?", [position])))[0]
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: score}), {});

    return dbResponse;
};

const matchTagColor = async (color) => {
    if (!color || typeof color !== 'string') {
        return {};
    }

    const dbResponse = (await query(format("SELECT *\n" +
        "FROM Tag t\n" +
        "       LEFT JOIN TagDeployment td on t.Number = td.TagNumber\n" +
        "       LEFT JOIN Seal s on td.SealId = s.FirstObservation\n" +
        "WHERE Color = ?", [color])))[0]
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: 4}), {})

    return dbResponse;
};

const aggregateScoreLists = (scoreLists) => {
    let scores = {};
    for (let i = 0; i < scoreLists.length; i++) {
        const currentScoreList = Object.entries(scoreLists[i]);
        for (let j = 0; j < currentScoreList.length; j++) {
            const [sealId, score] = currentScoreList[i];
            if (sealId in scores) {
                scores[sealId] = scores[sealId] + score;
            } else {
                scores[sealId] = score;
            }
        }
    }
    return scores;
};
