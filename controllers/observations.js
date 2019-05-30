import {sendData, sendError} from "../utils/responseHelper";
import {body, param, validationResult} from 'express-validator/check';
import {
   getPendingObservations, isValidPending, isValidObservation
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
   let seal;
   const date = req.body.date && new Date(req.body.date);
   const season = date && date.getFullYear();
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   // check for fully valid observation
   let matchingIds = await isValidObservation(req.body);

   if (matchingIds) {
      if (matchingIds.tagNum) {
         seal = await getSealFromTag(matchingIds.tagNum);
      }
      else if (matchingIds.markNum) {
         seal = await getSealFromMark(matchingIds.markNum, season);
      }
      sendData(res, seal);
      return;
   }

   // check for partially valid observation
   let validPending = await isValidPending(req.body);

   if (validPending) {
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
