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

/* GET users listing. */
usersRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

usersRouter.post('/register', validate('register'), register);
usersRouter.get('/:id', validate('getUser'), getUser);

// TODO: Does username exist?
// TODO: Does email exist?

usersRouter.delete('/:id', validate('deleteUser'), deleteUser);
usersRouter.put('/:id', validate('updateUser'), updateUser);

// not sure how approving a user will fit into the database?
usersRouter.put('/:id', validate('approveUser'), approveUser);

module.exports = usersRouter;
