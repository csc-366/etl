import {sendData, sendError} from "../utils/responseHelper";
import {body, param, validationResult} from 'express-validator/check';
import {
   getPendingObservations, isValidPending, isValidObservation
} from "../models/observations";
import {getSealsFromMark, getSealsFromTag} from "../models/seals";


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
   let tag = req.body.tag;
   let mark = req.body.mark;
   let seal;
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   // check for fully valid observation
   let validObservation = await isValidObservation(req.body);

   if (validObservation) {
      if (tag) {
         seal = await getSealsFromTag(tag);
      }
      else {
         seal = await getSealsFromMark(mark);
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
