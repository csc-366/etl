import {sendData, sendError} from "../utils/responseHelper";
import {check, body, validationResult} from 'express-validator/check';
import {
   getPendingObservations,
   getPendingObservationsCount,
   getPendingObservation,
   getCompleteIdentifiers,
   getObservations,
   getPartialIdentifiers,
   getSealObservations,
   insertObservation,
   insertSealObservation, isValidDate, isValidLocation
} from "../models/observations";
import {
   addNewSeal,
   getSealFromMark,
   getSealFromTag,
   getSealsFromPartialMark,
   getSealsFromPartialTag
} from "../models/seals";
import {insertPupAge, insertPupCount} from "../models/pups";
import {getMark, insertMarks} from "../models/marks";
import {getTag, insertTags} from "../models/tags";
import {getObserver, insertObserver} from "../models/observers";
import {insertMeasurement, selectMeasurement} from "../models/measurements";

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

export async function getAllObservations(req, res) {
    const location = req.query.location;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const observer = req.query.observer;
    const ageClass = req.query.ageClass;

    const observations = await getObservations();

    sendData(res, observations)
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
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   req.body = req.body.data;
   if ((req.body.tags && req.body.tags.length < 1)
    || (req.body.marks && req.body.marks.length < 1)) {
      sendError(res, 400, ["Must have at least one tag or mark"]);
      return;
   }

   const date = req.body.date && new Date(req.body.date);
   const season = date && date.getFullYear();

   if (!isValidDate(date)) {
      sendError(res, 400, ["Invalid observation: Supplied date is" +
      " either in the future, or before 2017"]);
      return;
   }

   if (!isValidLocation(req.body.location)) {
      sendError(res, 400, [`Unknown location: ${req.body.location}`]);
      return;
   }

   let {completeTags, completeMarks} = await getCompleteIdentifiers(req.body);
   completeMarks.season = season;

   if (completeTags.length || completeMarks.length) {
      await respondWithSealMatches(res, completeTags, completeMarks);
      return;
   }
   if (await invalidNewIdentifiers(req, res, completeTags, completeMarks)) {
      return;
   }

   if (completeTags.length || completeMarks.length) {
      await respondWithSealMatches(res, completeTags, completeMarks);
      return;
   }

   // check for partially valid observation
   let {partialTags, partialMarks} = await getPartialIdentifiers(req.body);
   partialMarks.season = season;

   if (partialTags.length || partialMarks.length) {
      await respondWithPotentialMatches(res, partialTags, partialMarks);
   } else {
      sendError(res, 400, ['Bad tag or mark format']);
   }

}

// assumes that error checking by validateObservation has already been done
export async function submitObservation(req, res) {
    const body = req.body;
    const date = body.date && new Date(body.date);
    const season = date && date.getFullYear();
    const errors = validationResult(req);
    let existingObserver;
    let seal;
    let sealId;

    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return;
    }

    try {

       if (body.observer) {
          existingObserver = await getObserver(body.observer);
       }
       if (!existingObserver && body.observer) {
          await insertObserver(body.observer);
       }

       const observationId = await insertObservation(body, req.session.username);

       if (body.tags && body.tags.length) {
          seal = await getSealFromTag(body.tags[0].number);
          sealId = seal && seal.FirstObservation;
       } else if (body.marks && body.marks.length) {
          seal = await getSealFromMark(body.marks[0].number, season);
          sealId = seal && seal.FirstObservation;
       } else {
          sendError(res, 400, ["Could not add seal to database. No marks or tags" +
          " found in observation"])
       }

       if (!seal) {
          await addNewSeal(observationId, body.sex, body.procedure);
          sealId = observationId;
       }
       if (body.measurement) {
          await insertMeasurement(observationId, body.measurement);
       }
       if (body.pupAge) {
          await insertPupAge(observationId, body.pupAge);
       }
       if (body.pupCount) {
          await insertPupCount(observationId, body.pupCount);
       }
       if (body.marks && body.marks.length) {
          await insertMarks(observationId, body.marks, season, sealId);
       }
       if (body.tags && body.tags.length) {
          await insertTags(observationId, body.tags, sealId);
       }

       await insertSealObservation(observationId, sealId);
       const observations = await getSealObservations(sealId);
       sendData(res, observations);
    }

    catch (e) {
       sendError(res, 500, [e.toString()]);
    }

}


export async function getMeasurements(req, res) {
    const measurements = await selectMeasurement(req.params.observationId);

    if (measurements) {
        sendData(res, measurements);
    }
    else {
        sendData(res, {
            ObservationId: req.params.observationId,
            StandardLength: null,
            CurvilinearLength: null,
            AxillaryGirth: null,
            TotalMass: null,
            MassTare: null
        });
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
        switch (key) {
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
                const marks = [agg.marks[0], {...agg.marks[1], number: value}];
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
    }, {marks: [{}, {}], tags: [{}, {}]});
    return formattedObservation;
};

export const validate = (method) => {
    switch (method) {
        case 'singlePending':
            return [];
        case 'pending':
            return [];
        case 'getPending':
            return [];
        case 'count':
            return [];
        case 'pendingCount':
            return [];
        case 'validateObservation':
            return [
               body('data.location')
                 .exists().withMessage("is required")
                 .isLength({min: 1})
                 .withMessage("must be at least 1 character long"),
               body('data.date')
                 .exists().withMessage("is required")
                 .isLength({min: 1})
                 .withMessage("must be at least 1 character long"),
            ];
        case 'getAllObservations':
            return [];
        case 'getFilteredPending':
            return [];
        case 'convertPending':
            return [];
        case 'deletePending':
            return [];

        case 'submitObservation':
            return [
                body('date')
                    .exists().withMessage("is required")
                    .isLength({min: 1})
                    .withMessage("must be at least 1 character long"),
            ];
        case 'submitPending':
            return [
                body('date')
                    .exists().withMessage("is required")
                    .isLength({min: 1})
                    .withMessage("must be at least 1 character long"),
                body('location')
                    .exists().withMessage("is required")
                    .isLength({min: 1})
                    .withMessage("must be at least 1 character long"),
            ];
        case "getMeasurements":
            return [];
        case 'all':
            return [];
    }
};

// TODO: If there are multiple valid tags or multiple valid marks, this code
//  only returns the seal associated with the first tag or mark in the array.
async function respondWithSealMatches(res, tagNums, markNums) {
    let seal, sealObservations;

    if (tagNums.length) {
      seal = await getSealFromTag(tagNums[0]);
      if (seal) {
         sealObservations = await getSealObservations(seal.SealId);
         sendData(res, {status: "OK", seal, sealObservations});
      }
      else {
         sendData(res, []);
      }
   }
   else if (markNums.length) {
      seal = await getSealFromMark(markNums[0], markNums.season);
      if (seal) {
         sealObservations = await getSealObservations(seal.SealId);
         sendData(res, {status: "OK", seal, sealObservations});
      }
      else {
         sendData(res, []);
      }
   }
   else {
      sendError(res, 400, ["Could not add seal to database. No marks or tags" +
       " found in observation"])
    }
}

async function respondWithPotentialMatches(res, tagNums, markNums) {
   let potentialSeals;
   let observations = [];
   let response = [];

   if (tagNums.length) {
      potentialSeals = await getSealsFromPartialTag(tagNums[0]);

      for (let i = 0; i < potentialSeals.length; i ++) {
         observations = await getSealObservations(potentialSeals[i].SealId);
         response.push({seal: potentialSeals[i], sealObservations: observations});
      }
      sendData(res, {status: "WARNING", response});
   }
   else if (markNums.length) {
      potentialSeals = await getSealsFromPartialMark(markNums[0], markNums.season);

      for (let i = 0; i < potentialSeals.length; i ++) {
         observations = await getSealObservations(potentialSeals[i].SealId);
         response.push({seal: potentialSeals[i], sealObservations: observations});
      }
      sendData(res, {status: "WARNING", response});
   }
   else {
      sendError(res, 400, ["Could not add seal to database. No marks or tags" +
       " found in observation"])
    }
}

async function invalidNewIdentifiers(req, res, completeTags, completeMarks) {
    for (let i = 0; i < completeTags.length; i++) {
        let tag = await getTag(completeTags[i]);
        if (tag && req.body.tags[i].isNew) {
            sendError(res, 400, ['A matching tag that is listed as new already exists in the database.']);
            return true;
        }
    }
    for (let i = 0; i < completeMarks.length; i++) {
        let mark = await getMark(completeMarks[i], completeMarks.season);
        if (mark && req.body.marks[i].isNew) {
            sendError(res, 400, ['A matching mark that is listed as new already exists in the database.']);
            return true;
        }
    }
    return false;
}

