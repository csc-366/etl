import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import sessionUtil from './utils/sessionUtil';
import indexRouter from './routes/index';
import sessionsRouter from './routes/sessions';
import usersRouter from './routes/users';
import etlRouter from './routes/etl';
import observationRouter from './routes/observations';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
// TODO: check general login with sessionUtil
app.use(sessionUtil.router);
app.use(sessionUtil.checkLogin);
*/
app.use((req, res, next) => {
   console.log("REQUEST PATH: " + req.path);
   next();
})
app.use('/', indexRouter);
app.use('/sessions', sessionsRouter);
app.use('/users', usersRouter);
app.use('/etl', etlRouter);
app.use('/obs', observationRouter);

module.exports = app;
