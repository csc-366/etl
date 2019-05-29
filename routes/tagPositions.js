import {Router} from "express"
import {validate, getTagPositions, addTagPosition} from "../controllers/tagPositions"

const tagPositionsRouter = Router();

tagPositionsRouter.post('/', validate('addTagPosition'), addTagPosition);
tagPositionsRouter.get('/', validate('getTagPositions'), getTagPositions);

export default tagPositionsRouter;