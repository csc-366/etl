import Router from 'express';
import {
   submitObservation,
   validateObservation,
   validate,
   getMeasurements,
   getFilteredObservations} from "../controllers/observations";
import {
   getFilteredPending, getPending, pendingCount,
   submitPending
} from "../controllers/pendingObservations";

const observationsRouter = Router();

/*
 * TODO: Get most recent observations
 *      - This is a function that needs to support large amounts of filtration/configuration.
 *        Basically every attribute in the database needs to be configurable. We need to figure out
 *        how to abstract the filtration behavior away from the actual request, because several requests might
 *        need filtration functionality. Maybe it would be best to filter each of the respective tables in the
 *        /models directory. That way filtration is distributed by the attributes of a table and won't be all
 *        clumped together in a filtration utility.
*/

// pending observations
observationsRouter.get('/pending', validate('getPending'), getPending);
observationsRouter.get('/count', validate('pendingCount'), pendingCount);
observationsRouter.get('/pending/filtered', validate('getFilteredPending'), getFilteredPending);
observationsRouter.post('/pending', validate('submitPending'), submitPending);

// complete observations
observationsRouter.get('/filtered', validate('getFilteredObservations'), getFilteredObservations);
observationsRouter.get('/:observationId/measurements', validate('getMeasurements'), getMeasurements);
observationsRouter.post('/', validate('submitObservation'), submitObservation);

// validation
observationsRouter.post('/validateObservation', validate('validateObservation'), validateObservation);

export default observationsRouter;