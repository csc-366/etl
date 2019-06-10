import {sendData, sendError} from "../utils/responseHelper";
import {body, param, validationResult} from 'express-validator/check';
import {
    acceptUser,
    getAllUsers,
    getUserByUsername,
    addUser,
    deactivateUser, setDBUserStatus
} from '../models/users';
import {getExistingAffiliations} from "../models/formOptions";

export async function register(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   if (req.body.affiliation) {
      const existingAffiliations = await getExistingAffiliations();

      const selectedAffiliation = existingAffiliations.filter((aff) => {
         return aff.Affiliation === req.body.affiliation;
      });

      if (!selectedAffiliation.length) {
         sendError(res, 400, `The affiliation '${req.body.affiliation}' does not exist`);
      }
   } else {
      req.body.affiliation = "None";
   }

   const user = await addUser(req.body);

    if (user === null) {
        sendError(res, 400,
            `A username with ${req.body.username} already exists`);
        return;
    }

    sendData(res, user);
}

export async function getUser(req, res) {
    let username = req.params.username;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return;
    }

    let user = await getUserByUsername(username);

    if (req.session.isAdmin() || username === user.Username) {
        if (!user) {
            sendData(res, []);
        }
        else {
            sendData(res, user);
        }
    }
    else {
        sendError(res, 403, "Forbidden");
    }
}

export async function getUsers(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return;
    }

    let users = await getAllUsers();

    if (req.session.isAdmin()) {
        sendData(res, users);
    }
    else {
        sendError(res, 403, "Forbidden");
    }
}

export async function deleteUser(req, res) {
    let username = req.params.username;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return;
    }

    let user = await getUserByUsername(username);

    if (!user) {
        sendError(res, 400, `${username} does not exist`);
    }
    else if (user.Status === "Deactivated") {
        sendError(res, 400, `${username} is already deactivated`);
    }

    if (req.session.isAdmin() || username === user.Username) {
        await deactivateUser(username);
        sendData(res, `${username} successfully deleted.`)
    } else {
        sendError(res, 403, "Forbidden");
    }
}

export async function updateUser(req, res) {

}

export async function setUserStatus(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        sendError(res, 400, errors.array());
        return
    }

    const {username} = req.params;
    const {status} = req.body;

    if (!req.session.isAdmin()) {
        sendError(res, 403, `Must be admin to approve users`);
        return;
    }

    let user = await getUserByUsername(username);

    if (!user) {
        sendError(res, 400, `${username} does not exist`);
        return;
    }

    if (user.Status === status) {
        sendError(res, 400, `${username} is already ${status}`);
        return;
    }

    await setDBUserStatus(username, status);

    sendData(res, `${username}'s account status set to ${status}`);
}

export const validate = (method) => {
    switch (method) {
        case 'register':
            return [
                body('username')
                    .exists().withMessage("is required")
                    .isLength({min: 1})
                    .withMessage("must be at least 1 character long"),
                body('password')
                    .exists().withMessage("is required")
                    .isLength({min: 1})
                    .withMessage("must be at least 1 character long"),
                body('firstName')
                    .exists().withMessage("is required")
                    .isLength({min: 1})
                    .withMessage("must be at least 1 character long"),
                body('lastName')
                    .exists().withMessage("is required")
                    .isLength({min: 1})
                    .withMessage("must be at least 1 character long"),
                body('email')
                    .exists().withMessage("is required")
                    .isLength({min: 1})
                    .withMessage("must be at least 1 character long"),
                body('role')
                    .exists().withMessage("is required")
                    .isIn(['Admin', 'Scientist', 'Citizen Scientist'])
                    .withMessage("Invalid role selected")
            ];
        case 'getUser':
            return [];
        case 'deleteUser':
            return [];
        case 'updateUser':
            return [];
        case 'userStatus':
            return [
                param('username')
                    .exists().withMessage("is required"),
                body('status')
                    .exists().withMessage("is required")
                    .custom(userStatusValidator).withMessage("must be 'Active', 'Pending', or 'Deactivated'")
            ];

        default:
            return [];
    }

};

const userStatusValidator = value => ['Active', 'Pending', 'Deactivated'].includes(value);