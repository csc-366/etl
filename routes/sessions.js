import {Router} from 'express';
import {
   validate,
   login,
   getSessions,
   logout
} from '../controllers/sessions';

const sessionsRouter = Router();

/*
 * TODO:
 *  - Reject unapproved account?
*/

sessionsRouter.post('/login', validate('login'), login);
sessionsRouter.get('/', validate('getSessions'), getSessions);
sessionsRouter.post('/', validate('logout'), logout);


export default sessionsRouter;
