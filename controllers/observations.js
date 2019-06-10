import {sendData, sendError} from "../utils/responseHelper";
import {body, param, validationResult} from 'express-validator/check';
import {
    getPendingObservations, getPartialIdentifiers, getCompleteIdentifiers,
    getSealObservations, getPendingObservationsCount, getPendingObservation
} from "../models/observations";
import {
    getSealFromMark,
    getSealFromTag, getSealsFromPartialMark,
    getSealsFromPartialTag
} from "../models/seals";

export async function all(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return;
    }

    const pendingList = await getPendingObservations();
    const formattedPendingList = pendingList.map(observation => mapObservation(observation));

    sendData(res, formattedPendingList)
}

export async function pending(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return;
    }

    const pendingList = await getPendingObservations(req.query.count, req.query.page);

    sendData(res, pendingList);
}

export async function count(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return;
    }

    const pendingCount = await getPendingObservationsCount();

    sendData(res, pendingCount);
}

export async function validateObservation(req, res) {
    const date = req.body.date && new Date(req.body.date);
    const season = date && date.getFullYear();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return;
    }

    let {completeTags, completeMarks} = await getCompleteIdentifiers(req.body);
    completeMarks.season = season;

    if (completeTags.length || completeMarks.length) {
        await respondWithSealMatches(res, completeTags, completeMarks);
        return;
    }

    // check for partially valid observation
    let {partialTags, partialMarks} = await getPartialIdentifiers(req.body);
    partialMarks.season = season;

    if (partialTags.length || partialMarks.length) {
        await respondWithPotentialMatches(res, partialTags, partialMarks);
    }
    else {
        sendError(res, 400, 'Invalid observation');
    }
}

export async function singlePending(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return;
    }

    const {id} = req.params;
    const observation = await getPendingObservation(id);
    const formattedObservation = mapObservation(observation);
    sendData(res, formattedObservation)
}

const mapObservation = (observation) => {
    const formattedObservation = Object.entries(observation).reduce((agg, [key, value]) => {
        switch(key) {
            case 'Age':
            case 'Comments':
            case 'EnteredInAno':
            case 'FirstSeenAsWeanling':
            case 'Location':
            case 'LastSeenAsPup':
            case 'MoltPercentage':
            case 'ObservationId':
            case 'PupCount':
            case 'Range':
            case 'Season':
            case 'Sex':
            case 'Year':
            case 'Date':
                return {
                    ...agg,
                    [key]: value
                };
            case 'AnimalMass':
            case 'AxillaryGirth':
            case 'Mass':
            case 'StandardLength':
            case 'Tare':
            case 'CurvilinearLength': {
                const measurement = agg.measurement ? {...agg.measurement, [key]: value} : {[key]: value};
                return {
                    ...agg,
                    measurement
                }
            }
            case 'FieldLeaders':
                return {
                    ...agg,
                    [key]: value ? value.split(',') : []
                };
            case 'Mark1': {
                const marks = [{...agg.marks[0], number: value}, agg.marks[1]];
                return {...agg, marks};
            }
            case 'NewMark1': {
                const marks = [{...agg.marks[0], isNew: value}, agg.marks[1]];
                return {...agg, marks};
            }
            case 'Mark1Position': {
                const marks = [{...agg.marks[0], position: value}, agg.marks[1]];
                return {...agg, marks};
            }
            case 'Mark2': {
                const marks = [agg.marks[0],{...agg.marks[1], number: value}];
                return {...agg, marks};
            }
            case 'NewMark2': {
                const marks = [agg.marks[0], {...agg.marks[1], isNew: value}];
                return {...agg, marks};
            }
            case 'Mark2Position': {
                const marks = [agg.marks[0], {...agg.marks[1], position: value}];
                return {...agg, marks};
            }
            case 'Tag1Number': {
                const tags = [{...agg.tags[0], number: value}, agg.tags[1]];
                return {...agg, tags};
            }
            case 'NewTag1': {
                const tags = [{...agg.tags[0], isNew: value}, agg.tags[1]];
                return {...agg, tags};
            }
            case 'Tag1Position': {
                const tags = [{...agg.tags[0], position: value}, agg.tags[1]];
                return {...agg, tags};
            }
            case 'NewTag2': {
                const tags = [agg.tags[0], {...agg.tags[1], isNew: value}];
                return {...agg, tags};
            }
            case 'Tag2Number': {
                const tags = [agg.tags[0], {...agg.tags[1], number: value}];
                return {...agg, tags};
            }
            case 'Tag2Position': {
                const tags = [agg.tags[0], {...agg.tags[1], position: value}];
                return {...agg, tags};
            }
            default:
                return agg
        }
    }, {marks: [{},{}],tags: [{},{}]});
    return formattedObservation;
};

export const validate = (method) => {
    switch (method) {
        case 'all':
            return [];
        case 'pending':
            return [];
        case 'singlePending':
            return [];
        case 'count':
            return [];
        case 'validateObservation':
            return [];
    }
};

// TODO: If there are multiple valid tags or multiple valid marks, this code
//  only returns the seal associated with the first tag or mark in the array.
//  I don't trust the data enough to expect that a only a single seal will
//  match... but for now this is the case.
async function respondWithSealMatches(res, tagNums, markNums) {
    let seal, sealObservations;

    if (tagNums.length) {
        seal = await getSealFromTag(tagNums[0]);
        if (seal) {
            sealObservations = await getSealObservations(seal.SealId);
            sendData(res, {seal, sealObservations});
        }
        else {
            sendData(res, "No seals with this tag number found.");
        }
    }
    else if (markNums.length) {
        seal = await getSealFromMark(markNums[0], markNums.season);
        if (seal) {
            sealObservations = await getSealObservations(seal.SealId);
            sendData(res, {seal, sealObservations});
        }
        else {
            sendData(res, "No seals with this mark found.");
        }
    }
    else {
        sendError(res, 500, "Shouldn't have reached this code :(");
    }
}

async function respondWithPotentialMatches(res, tagNums, markNums) {
    let potentialSeals;
    let observations = [];
    let response = [];

    if (tagNums.length) {
        potentialSeals = await getSealsFromPartialTag(tagNums[0]);

        for (let i = 0; i < potentialSeals.length; i++) {
            observations = await getSealObservations(potentialSeals[i].SealId);
            response.push({seal: potentialSeals[i], sealObservations: observations});
        }
        sendData(res, response);
    }
    else if (markNums.length) {
        potentialSeals = await getSealsFromPartialMark(markNums[0], markNums.season);

        for (let i = 0; i < potentialSeals.length; i++) {
            observations = await getSealObservations(potentialSeals[i].SealId);
            response.push({seal: potentialSeals[i], sealObservations: observations});
        }
        sendData(res, response);
    }
    else {
        sendError(res, 500, "Shouldn't have reached this code :(");
    }
}
