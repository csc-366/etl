import express from 'express';

let router = express.Router();

/*
 * TODO: Get most recent observations
 *      - This is a function that needs to support large amounts of filtration/configuration.
 *        Basically every attribute in the database needs to be configurable. We need to figure out
 *        how to abstract the filtration behavior away from the actual request, because several requests might
 *        need filtration functionality. Maybe it would be best to filter each of the respective tables in the
 *        /models directory. That way filtration is distributed by the attributes of a table and won't be all
 *        clumped together in a filtration utility.
*/

export default router;