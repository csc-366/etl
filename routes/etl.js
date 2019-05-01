import express from 'express';
import multer from 'multer';
import {etlIngest} from "../controllers/ETLController";

const upload = multer({dest: 'uploads/'});

let router = express.Router();

router.post('/', upload.single('data'), etlIngest);

export default router;
