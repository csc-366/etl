import {sendData, sendError} from "../utils/responseHelper";
import {body, validationResult} from 'express-validator/check';
import {
   getCompleteIdentifiers,
   getObservationsWithFilters,
   getPartialIdentifiers,
   getSealObservations,
   insertObservation,
   insertSealObservation
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

export async function getFilteredObservations(req, res) {
   const location = req.query.location;
   const startDate = req.query.startDate;
   const endDate = req.query.endDate;
   const observer = req.query.observer;
   const ageClass = req.query.ageClass;

   const observations = await getObservationsWithFilters({location,
      startDate, endDate, observer, ageClass});

   sendData(res, observations)
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
   }
   else {
      sendError(res, 400, ['Bad mark or tag format.']);
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
   }
   else if (body.marks && body.marks.length) {
      seal = await getSealFromMark(body.marks[0].number, season);
      sealId = seal && seal.FirstObservation;
   }
   else {
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
         MassTare: null});
   }
}

export const validate = (method) => {
   switch (method) {
      case 'getPending':
         return [];
      case 'pendingCount':
         return [];
      case 'validateObservation':
         return [];
      case 'getFilteredObservations':
         return [];
      case 'getFilteredPending':
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
          ]
      case "getMeasurements":
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
      sendData(res, response);
   }
   else if (markNums.length) {
      potentialSeals = await getSealsFromPartialMark(markNums[0], markNums.season);

      for (let i = 0; i < potentialSeals.length; i ++) {
         observations = await getSealObservations(potentialSeals[i].SealId);
         response.push({seal: potentialSeals[i], sealObservations: observations});
      }
      sendData(res, response);
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
         sendError(res, 400, ['A tag that ' +
          'is listed as new already exists in the database.']);
         return true;
      }
   }
   for (let i = 0; i < completeMarks.length; i++) {
      let mark = await getMark(completeMarks[i], completeMarks.season);
      if (mark && req.body.marks[i].isNew) {
         sendError(res, 400, ['A mark ' +
          'that is listed as new already exists in the database.']);
         return true;
      }
   }
   return false;
}

