import {Router} from 'express';
import {
   validate,
   login,
   getSession,
   logout
} from '../controllers/sessions';

const sessionsRouter = Router();

/*
 * TODO: Log user in
 *  - Generate Session Token
 *  - Remember, do NOT store secrets in plain text in this file!! Put it in .env and use process.env!!
 *  - Reject invalid username/password combo
 *  - Reject unapproved account?
*/

sessionsRouter.post('/login', validate('login'), login);
sessionsRouter.get('/:cookie', validate('getSession'), getSession);
sessionsRouter.delete('/logout', validate('logout'), logout);


export default sessionsRouter;
