import {sendData, sendError} from "../utils/responseHelper";
import {body, param, validationResult} from 'express-validator/check';
import {addNewLocation, getExistingLocations} from "../models/locations";


export async function addLocation(req, res) {
   const body = req.body;
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   if (!req.session.isAdmin()) {
      sendError(res, 403, "Must be admin");
      return;
   }

   let result = await addNewLocation(body.beach, body.beachName, body.rookery);

   const locations = await getExistingLocations();
   sendData(res, locations);
}

export async function getLocations(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const locations = await getExistingLocations();

   sendData(res, locations);
}

export const validate = (method) => {
   switch (method) {
      case "addLocation":
         return [
            body('beach')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("beach must be at least 1 character long"),
            body('beachName')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("beachName must be at least 1 character long"),
            body('rookery')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("rookery must be at least 1 character long")
         ];
      case "getLocations":
         return [];
   }

}