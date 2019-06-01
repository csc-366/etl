import {sendData, sendError} from "../utils/responseHelper";
import {body, param, validationResult} from 'express-validator/check';
import {
   getPendingObservations, getPartialIdentifiers, getCompleteIdentifiers,
   getSealObservations
} from "../models/observations";
import {getSealFromMark, getSealFromTag} from "../models/seals";


export async function pending(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const pendingList = await getPendingObservations(req.query.count, req.query.page);

   sendData(res, pendingList);
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
   markNums.season = season;

   if (completeTags.length || completeMarks.length) {
      await respondWithSealMatches(res, completeTags, completeMarks);
      return;
   }

   // check for partially valid observation
   let {partialTags, partialMarks} = await getPartialIdentifiers(req.body);

   if (partialTags.length || partialMarks.length) {
      await respondWithPotentialMatches(res, partialTags, partialMarks);
      sendError(res, 400, "Partial observation. Valid as a pending" +
       " observation")
   }
   else {
      sendError(res, 400, `Invalid observation`);
   }
}

export const validate = (method) => {
   switch (method) {
      case 'pending':
         return [];
      case 'validateObservation':
         return [];
   }

}

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
      sendError(res, 500,  "Shouldn't have reached this code :(");
    }
}


