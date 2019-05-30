import { Router} from "express"
import { getFormOptions, validate, addColor, addTagPosition, addLocation,
   addRookery, addAffiliation, addAgeClass } from "../controllers/formOptions"

const formOptionsRouter = Router();

formOptionsRouter.post('/colors', validate('addColor'), addColor);
formOptionsRouter.post('/rookeries', validate('addRookery'), addRookery);
formOptionsRouter.post('/locations', validate('addLocation'), addLocation);
formOptionsRouter.post('/ageClasses', validate('addAgeClass'), addAgeClass);
formOptionsRouter.post('/tagPositions', validate('addTagPosition'), addTagPosition);
formOptionsRouter.post('/affiliations', validate('addAffiliation'), addAffiliation);

formOptionsRouter.get('/', validate('getFormOptions'), getFormOptions);



export default formOptionsRouter;
