import {sendData, sendError} from "../utils/responseHelper";
import {body, param, validationResult} from 'express-validator/check';
import {addNewColor, getExistingColors} from "../models/colors";

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

   let result = await addNewColor(req.body.color, req.body.colorName);

   const colors = await getExistingColors();
   sendData(res, colors);
}

export async function getColors(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const colors = await getExistingColors();

   sendData(res, colors);
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
      case "getColors":
         return [];
   }
};