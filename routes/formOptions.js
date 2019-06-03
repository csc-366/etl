import { Router} from "express"
import { getFormOptions, validate, addColor, deleteColor, addTagPosition,
   deleteTagPosition, addLocation, deleteLocation, addRookery, deleteRookery,
   addAffiliation, deleteAffiliation, addAgeClass, deleteAgeClass
} from "../controllers/formOptions"

const formOptionsRouter = Router();

formOptionsRouter.post('/colors', validate('addColor'), addColor);
formOptionsRouter.delete('/colors', validate('deleteColor'), deleteColor);

formOptionsRouter.post('/rookeries', validate('addRookery'), addRookery);
formOptionsRouter.delete('/rookeries', validate('deleteRookery'), deleteRookery);

formOptionsRouter.post('/locations', validate('addLocation'), addLocation);
formOptionsRouter.delete('/locations', validate('deleteLocation'), deleteLocation);

formOptionsRouter.post('/ageClasses', validate('addAgeClass'), addAgeClass);
formOptionsRouter.delete('/ageClasses', validate('deleteAgeClass'), deleteAgeClass);

formOptionsRouter.post('/tagPositions', validate('addTagPosition'), addTagPosition);
formOptionsRouter.delete('/tagPositions', validate('deleteTagPosition'), deleteTagPosition);

formOptionsRouter.post('/affiliations', validate('addAffiliation'), addAffiliation);
formOptionsRouter.delete('/affiliations', validate('deleteAffiliation'), deleteAffiliation);

formOptionsRouter.get('/', validate('getFormOptions'), getFormOptions);



export default formOptionsRouter;
