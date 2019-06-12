import Router from 'express';
import {
   getSeals, getSealFromObservation, getSealFromSealId, getObservationsFromSealId,
   validate,
} from "../controllers/seals";

const sealsRouter = Router();


sealsRouter.get('/', validate('getSeals'), getSeals);
sealsRouter.get('/:sealId', validate('getSealFromSealId'), getSealFromSealId);
sealsRouter.get('/observation/:id', validate('getSealFromObservation'), getSealFromObservation);
sealsRouter.get('/:sealId/observations', validate('getSealFromObservation'), getObservationsFromSealId);


export default sealsRouter;

