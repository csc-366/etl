import {sendData, sendError} from "../utils/responseHelper";
import {body, param, validationResult} from 'express-validator/check';
import {addNewTagPosition, getAllTagPositions} from "../models/tagPositions";

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

export async function getTagPositions(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const tagPositions = await getAllTagPositions();

   sendData(res, tagPositions);
}

export const validate = (method) => {
   switch (method) {
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
      case 'getTagPositions':
         return [];
   }
}
