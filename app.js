import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import * as sessionUtil from './utils/sessionUtil';
import indexRouter from './routes/index';
import sessionsRouter from './routes/sessions';
import usersRouter from './routes/users';
import etlRouter from './routes/etl';
import observationRouter from './routes/observations';
import formOptionsRouter from "./routes/formOptions";
import exportRouter from './routes/export';
import sealsRouter from "./routes/seals";

process.title = "SeaQL-backend";

const app = express();

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
   console.log("REQUEST PATH: " + req.path);
   next();
});

app.use(sessionUtil.router);
app.use(sessionUtil.checkLogin);

app.use('/', indexRouter);
app.use('/seals', sealsRouter);
app.use('/sessions', sessionsRouter);
app.use('/users', usersRouter);
app.use('/observations', observationRouter);
app.use('/etl', etlRouter);
app.use('/formOptions', formOptionsRouter);
app.use('/export', exportRouter);

module.exports = app;
