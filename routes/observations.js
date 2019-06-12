import Router from 'express';
import {
    submitObservation,
    validateObservation,
    validate,
    getMeasurements,
    getAllObservations, singlePending, count, pending, all
} from "../controllers/observations";
import {
    convertPending, deletePending,
    getFilteredPending,
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

observationsRouter.get('/all', validate('all'), all);
observationsRouter.get('/pending', validate('pending'), pending);
observationsRouter.get('/pending/filtered', validate('getFilteredPending'), getFilteredPending);
observationsRouter.get('/pending/:id', validate('singlePending'), singlePending);
observationsRouter.get('/count', validate('count'), count);
observationsRouter.get('/', validate('getAllObservations'), getAllObservations);
observationsRouter.get('/:observationId/measurements', validate('getMeasurements'), getMeasurements);

observationsRouter.post('/', validate('submitObservation'), submitObservation);
observationsRouter.post('/validateObservation', validate('validateObservation'), validateObservation);

// pending observations
observationsRouter.get('/all', validate('all'), all);
observationsRouter.get('/count', validate('count'), count);
observationsRouter.get('/pending', validate('pending'), pending);
observationsRouter.get('/pending/:id', validate('singlePending'), singlePending);
observationsRouter.get('/pending/filtered', validate('getFilteredPending'), getFilteredPending);

observationsRouter.post('/pending', validate('pending'), submitPending);
observationsRouter.post('/pending/:pendingId/convert', validate('convertPending'), convertPending);

observationsRouter.delete('/pending', validate('deletePending'), deletePending);

export default observationsRouter;