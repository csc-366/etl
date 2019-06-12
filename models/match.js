import {format, query} from "./db2";

export const match = async (observation, count=10) => {
    const {sex, tags, marks} = observation;
    const sexScores = await matchSex(sex);
    const tagScores = await matchTags(tags);
    const markScores = await matchMarks(marks);

    const totalScores = aggregateScoreLists(Object.entries(sexScores) + Object.entries(tagScores)  + Object.entries(markScores));

    const limitedScores = Object.entries(totalScores).sort((a,b) => b[1]-a[1]).map(([sealId]) => sealId).slice(0,count);

    return limitedScores;
};

export const matchSex = async (sex) => {
    if (!sex) {
        return {}
    }

    const dbResult = (await query(format("SELECT FirstObservation FROM Seal WHERE Sex = ?", [sex])))[0]
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: 1}), {});

    return dbResult;
};

export const matchMarks = async (marks) => {
    if (!marks) {
        return;
    }

    const scoreLists = [];

    for (let i = 0; i < marks.length; i++) {
        const markNumberMatches = matchMarkNumber(marks[i].number);
        const markPositionMatches = matchMarkPosition(marks[i].position);

        const markScoreEntries = Object.entries(markNumberMatches) + Object.entries(markPositionMatches);

        const markScores = markScoreEntries.reduce((agg, [sealId, score]) => {
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
    if (!markNumber) {
        return {};
    }

    let score = (markNumber.includes('_')) ? 4 : 8;

    return (await query(format("SELECT s.FirstObservation from Mark m " +
       "LEFT JOIN MarkDeployment md on m.ID = = md.MarkId " +
       "LEFT JOIN Seal s on md.MarkId =  s.FirstObservation " +
       "WHERE m.Number LIKE ?", [markNumber])))[0]
       .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: score}), {});

};

const matchMarkPosition = async (markPosition) => {
    if (!markPosition) {
        return {};
    }

    return (await query(format("SELECT s.FirstObservation from Mark m " +
        "LEFT JOIN MarkDeployment md on m.ID = = md.MarkId " +
        "LEFT JOIN Seal s on md.MarkId =  s.FirstObservation " +
        "WHERE Position = ?", [markPosition])))[0]
        .reduce((agg, {FirstObservation}) => ({...agg, [FirstObservation]: 2}), {});
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

        const tagScoreEntries = Object.entries(tagNumberScores) + Object.entries(tagPositionScores) + Object.entries(tagColorScores);

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
