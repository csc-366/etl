import Router from 'express';
import {singlePending, count, validate, pending, validateObservation, all} from '../controllers/observations'

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
observationsRouter.get('/pending/:id', validate('singlePending'), singlePending);
observationsRouter.get('/count', validate('count'), count);
observationsRouter.post('/validateObservation', validate('validateObservation'), validateObservation);

export default observationsRouter;