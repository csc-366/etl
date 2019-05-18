import {sendData, sendError} from '../utils/responseHelper';
import {credentialsAreValid} from '../models/sessions';

export async function login(req, res, next) {
   console.log(req.body);
   const response = credentialsAreValid(req.body.username)

   sendData(res, response);
}

export async function getSession(req,res) {
   sendData(res, "Get session successful.");

}

export async function logout(req,res) {
   sendData(res, "Logout successful.");
}

export const validate = (method) => {
   return [];
}
