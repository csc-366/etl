import {format, query} from "./db2";

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
    const markNumberMatches = {
        sealId: score,...
    };
    const markPositionMatches = {
        sealId: score,...
    };

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
