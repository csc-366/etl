import express from 'express';
import multer from 'multer';
import {etlIngest} from "../controllers/ETLController";

const upload = multer({dest: 'uploads/'});

let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', upload.single('data'), etlIngest);

module.exports = router;
