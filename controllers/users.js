import {sendData, sendError} from "../utils/responseHelper";
import {body, validationResult} from 'express-validator/check';
import * as db from '../models/users';

export async function register(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const user = await db.addUser(req.body);

   if (user === null) {
      sendError(res, 400,
       `A username with ${req.body.username} already exists`);
      return;
   }

   sendData(res, user);
}

export async function getUser(req,res) {

}

export async function deleteUser(req,res) {

}

export async function updateUser(req,res) {

}

export async function approveUser(req,res) {

}

export const validate = (method) => {
   switch (method) {
      case 'register':
         return [
            body('username')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("must be at least 1 character long"),
            body('password')
             .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("must be at least 1 character long"),
            body('firstName')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("must be at least 1 character long"),
            body('lastName')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("must be at least 1 character long"),
            body('email')
               .exists().withMessage("is required")
               .isLength({min: 1})
               .withMessage("must be at least 1 character long"),
            body('role')
               .exists().withMessage("is required")
               .isIn(['Admin', 'Scientist', 'Citizen Scientist'])
               .withMessage("Invalid role selected")
         ];
      case 'getUser':
         return [];
      case 'deleteUser':
         return [];
      case 'updateUser':
         return [];
      case 'approveUser':
         return [];

      default:
         return [];
   }

};