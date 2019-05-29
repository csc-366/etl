import {Router} from "express"
import {validate, getColors, addColor} from "../controllers/colors"

const colorsRouter = Router();

colorsRouter.post('/', validate('addColor'), addColor);
colorsRouter.get('/', validate('getColors'), getColors);

export default colorsRouter;
