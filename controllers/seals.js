import {validationResult, body} from "express-validator/check";
import {
   getSealByObservationId,
   getSealBySealId,
   retrieveSeals
} from "../models/seals";
import {sendData, sendError} from "../utils/responseHelper";
import {getSealObservations} from "../models/observations";

export async function getSeals(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const seals = await retrieveSeals(req.query.count, req.query.page);

   sendData(res, seals);
}


export async function getSealFromObservation(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const seal = await getSealByObservationId(req.params.id);

   if (!seal) {
      sendError(res, 404, ["No seal found with this observationId"]);
      return;
   }

   sendData(res, seal);
}

export async function getSealFromSealId(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const seal = await getSealBySealId(req.params.sealId);

   if (!seal) {
      sendError(res, 404, ["No seal found with this sealId"]);
      return;
   }

   sendData(res, seal);
}

export async function getObservationsFromSealId(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const seal = await getSealObservations(parseInt(req.params.sealId));

   if (!seal) {
      sendError(res, 404, ["No seal found with this sealId"]);
      return;
   }

   sendData(res, seal);
}

export const validate = (method) => {
   switch (method) {
      case "getSeals":
         return [];
      case "getSealFromObservation":
         return [];
      case "getSealFromSealId":
         return [];

      default:
         return [];
   }
};