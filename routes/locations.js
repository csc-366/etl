import {Router} from "express"
import {validate, getLocations, addLocation} from "../controllers/locations"

const locationsRouter = Router();

locationsRouter.post('/', validate('addLocation'), addLocation);
locationsRouter.get('/', validate('getLocations'), getLocations);

export default locationsRouter;