import {sendData, sendError} from "../utils/responseHelper";
import {body, validationResult} from 'express-validator/check';
import {
   addNewAffiliation, addNewAgeClass, addNewColor, addNewLocation, addNewRookery,
   addNewTagPosition, getAllTagPositions, getExistingAffiliations, getExistingAgeClasses,
   getExistingColors, getExistingLocations, getExistingRookeries
} from "../models/formOptions";

export async function getFormOptions(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const locations = await getExistingLocations();
   const positions = await getAllTagPositions();
   const colors = await getExistingColors();
   const rookeries = await getExistingRookeries();
   const ageClasses = await getExistingAgeClasses();
   const affiliations = await getExistingAffiliations();

   sendData(res, {locations, positions, colors, rookeries, ageClasses, affiliations})
}

export async function addColor(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   if (!req.session.isAdmin()) {
      sendError(res, 403, "Must be admin");
      return;
   }

   if (req.body.colorName && req.body.colorName.length > 10) {
      sendError(res, 400, "colorName is too long");
   }

   let result = await addNewColor(req.body.color, req.body.colorName);

   const colors = await getExistingColors();
   sendData(res, colors);
}

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

export async function addTagPosition(req, res) {
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

   let result = await addNewTagPosition(body.position, body.nationalTagPosition,
    body.description);

   const tagPositions = await getAllTagPositions();
   sendData(res, tagPositions);
}

export async function addAgeClass(req, res) {
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

   let result = await addNewAgeClass(body.shortName, body.fullName);

   const ageClasses = await getExistingAgeClasses();
   sendData(res, ageClasses);
}

export async function addRookery(req, res) {
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

   let result = await addNewRookery(body.rookery, body.rookeryName);

   const rookeries = await getExistingRookeries();
   sendData(res, rookeries);
}

export async function addAffiliation(req, res) {
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

   let result = await addNewAffiliation(body.affiliation, body.description);

   const affiliations = await getExistingAffiliations();
   sendData(res, affiliations);
}

export const validate = (method) => {
   switch (method) {
      case "addColor":
         return [
            body('color')
               .exists().withMessage("is required")
               .isLength({min: 1, max: 1})
               .withMessage("color must be 1 character long"),
            body('colorName')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("color name must be at least 1 character long")
         ];
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
      case 'addTagPosition':
         return [
            body('position')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("position must be at least 1 character long"),
            body('nationalTagPosition')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("nationalTagPosition must be at least 1 character" +
                " long")
         ];
      case 'addRookery':
         return [
            body('rookery')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("rookery must be at least 1 character long"),
            body('rookeryName')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("rookeryName must be at least 1 character long")
         ];
      case 'addAgeClass':
         return [
            body('shortName')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("rookeryName must be at least 1 character long"),
            body('fullName')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("rookeryName must be at least 1 character long")
         ];
      case 'addAffiliation':
         return [
            body('affiliation')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("affiliation must be at least 1 character long")
         ];
      case 'getFormOptions':
         return [];

      default:
         return [];
   }
};
