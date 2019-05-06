import express from 'express';
import multer from 'multer';

const upload = multer({dest: 'uploads/'});

let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
