import {sendData, sendError} from "../utils/responseHelper";
import {body, param, validationResult} from 'express-validator/check';
import {getPendingObservations} from "../models/observations";


export async function pending(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const pendingList = await getPendingObservations(req.query.count, req.query.page)

   sendData(res, pendingList);
}


export const validate = (method) => {
   switch (method) {
      case 'pending':
         return [];
   }

}
