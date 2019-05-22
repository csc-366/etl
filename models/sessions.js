import {compare} from 'bcrypt';
import {getUserByUsername} from "./users";

export const credentialsAreValid = async (username, password) => {
   const user = await getUserByUsername(username);

   if (!user) {
      return null;
   }

   return await compare(password, user.PasswordHash);
};

export const sessionExists = async (cookie) => {

};

