import {Router} from 'express';
import {
   validate,
   login,
   getSession,
   logout
} from '../controllers/sessions';

const sessionsRouter = Router();

/*
 * TODO:
 *  - Reject unapproved account?
*/

sessionsRouter.post('/login', validate('login'), login);
sessionsRouter.get('/:cookie', validate('getSession'), getSession);
sessionsRouter.post('/:cookie', validate('logout'), logout);


export default sessionsRouter;
