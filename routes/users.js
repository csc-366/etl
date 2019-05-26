import {Router} from 'express';
import {
   validate,
   register,
   getUser,
   deleteUser,
   updateUser,
   approveUser
} from '../controllers/users';

const usersRouter = Router();
usersRouter.baseURL = '/users';


usersRouter.post('/register', validate('register'), register);
// TODO: Does username exist?
// TODO: Does email exist?

usersRouter.get('/:username', validate('getUser'), getUser);
usersRouter.delete('/:username', validate('deleteUser'), deleteUser);
usersRouter.put('/:username', validate('updateUser'), updateUser);

// TODO: need to address how approving a user will fit into app. add another
//  role?
usersRouter.put('/approve/:username', validate('approveUser'), approveUser);

module.exports = usersRouter;
