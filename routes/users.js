import {Router} from 'express';
import {
    validate,
    register,
    getUser,
    getUsers,
    deleteUser,
    updateUser,
    setUserStatus
} from '../controllers/users';

const usersRouter = Router();
usersRouter.baseURL = '/users';


usersRouter.get('/', validate('getUser'), getUsers);
usersRouter.get('/:username', validate('getUser'), getUser);
usersRouter.post('/register', validate('register'), register);
// TODO: Does username exist?
// TODO: Does email exist?

usersRouter.get('/:username', validate('getUser'), getUser);
usersRouter.get('/', validate('getUser'), getUsers);
usersRouter.delete('/:username', validate('deleteUser'), deleteUser);
usersRouter.put('/:username', validate('updateUser'), updateUser);

usersRouter.patch('/status/:username', validate('userStatus'), setUserStatus);

module.exports = usersRouter;
