import {format, query} from "./db2";

export const retrieveMatches = async (sealIds) => {
    const seals = [];
    let maxScore = 0;
    for (let i = 0; i < sealIds.length; i++) {
        const [sealId,score] = sealIds[i];
        const seal = (await query(format("SELECT s.*\n" +
            "FROM Seal s\n" +
            "WHERE s.FirstObservation = ?", [sealId])))[0][0];
        const tags = (await query(format("SELECT t.*\n" +
            "FROM TagDeployment td\n" +
            "       LEFT JOIN Tag t ON td.TagNumber = t.Number\n" +
            "WHERE td.SealId = ?", [sealId])))[0];
        const marks = (await query(format("SELECT m.*\n" +
            "FROM MarkDeployment md\n" +
            "       LEFT JOIN Mark m ON md.MarkId = m.ID\n" +
            "WHERE md.SealId = ?", [sealId])))[0];
        if (!seal) {
            continue;
        }
        if (score > maxScore) {
            maxScore = score;
        }
        seals.push({
            ...seal,
            tags,
            marks,
            score
        });
    }
    return {seals,maxScore};
};

export const match = async (observation, count = 10) => {
    const {sex, tags, marks} = observation;
    const sexScores = await matchSex(sex);
    const tagScores = await matchTags(tags);
    const markScores = await matchMarks(marks);

    const totalScores = aggregateScoreLists([sexScores, tagScores, markScores]);

    const limitedScores = Object.entries(totalScores)
        .sort((a, b) => b[1] - a[1])
        .map(([sealId]) => sealId)
        .slice(0, count)
        .reduce((agg, sealId) => ({...agg,[sealId]:totalScores[sealId]}),{});

    return Object.entries(limitedScores);
};

const matchSex = async (sex) => {
    if (!sex) {
        return {}
    }

    const dbResult = (await query(format("SELECT FirstObservation FROM Seal WHERE Sex = ?", [sex])))[0]
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: 1}), {});

    return dbResult;
};

const matchMarks = async (marks) => {
    if (!marks) {
        return {};
    }

    const scoreLists = [];

    for (let i = 0; i < marks.length; i++) {
        const markNumberMatches = await matchMarkNumber(marks[i].number);
        const markPositionMatches = await matchMarkPosition(marks[i].position);

        const markScoreEntries = aggregateScoreLists([markNumberMatches, markPositionMatches]);

        const markScores = Object.entries(markScoreEntries).reduce((agg, [sealId, score]) => {
            const updatedScore = (agg[sealId]) ? agg[sealId] + score : score;
            return {
                ...agg,
                [sealId]: updatedScore
            }
        }, {});

        scoreLists.push(markScores);
    }

    return aggregateScoreLists(scoreLists)
};

const matchMarkNumber = async (markNumber) => {
    if (!markNumber || typeof markNumber !== 'string') {
        return {};
    }

    let score = (markNumber.includes('_')) ? 4 : 8;

    return (await query(format("SELECT *\n" +
        "FROM Mark m\n" +
        "       LEFT JOIN MarkDeployment md on m.ID = md.MarkId\n" +
        "       LEFT JOIN Seal s on md.SealId = s.FirstObservation\n" +
        "WHERE Number LIKE ?", [markNumber])))[0]
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: score}), {});

};

const matchMarkPosition = async (markPosition) => {
    if (!markPosition || typeof markPosition !== 'string') {
        return {};
    }

    return (await query(format("SELECT *\n" +
        "FROM Mark m\n" +
        "       LEFT JOIN MarkDeployment md on m.ID = md.MarkId\n" +
        "       LEFT JOIN Seal s on md.SealId = s.FirstObservation\n" +
        "WHERE Position LIKE ?", [markPosition])))[0]
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: 2}), {});
};

const matchTags = async (tags) => {
    if (!tags) {
        return {};
    }

    const scoreLists = [];

    for (let i = 0; i < tags.length; i++) {
        const currentTag = tags[i];
        const tagNumberScores = await matchTagNumber(currentTag.number);
        const tagPositionScores = await matchTagPosition(currentTag.position);
        const tagColorScores = await matchTagColor(currentTag.color);

        const tagScoreEntries = [...Object.entries(tagNumberScores), ...Object.entries(tagPositionScores), ...Object.entries(tagColorScores)];

        const tagScores = tagScoreEntries.reduce((agg, [sealId, score]) => {
            const updatedScore = (agg[sealId]) ? agg[sealId] + score : score;
            return {
                ...agg,
                [sealId]: updatedScore
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
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: 4}), {});

    return dbResponse;
};

const aggregateScoreLists = (scoreLists) => {
    let scores = {};
    for (let i = 0; i < scoreLists.length; i++) {
        const currentScoreList = Object.entries(scoreLists[i]);
        for (let j = 0; j < currentScoreList.length; j++) {
            const [sealId, score] = currentScoreList[j];
            if (sealId in scores) {
                scores[sealId] = scores[sealId] + score;
            } else {
                scores[sealId] = score;
            }
        }
    }
    return scores;
};
