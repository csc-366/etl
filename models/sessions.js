import {compare} from 'bcrypt';
import {getUserByUsername} from "./users";

export const credentialsAreValid = async (username, password) => {
   const user = await getUserByUsername(username);

   if (!user) {
      return null;
   }
   else if (user.Status === "Pending" || user.Status === "Deactivated") {
      return null;
   }

   return await compare(password, user.PasswordHash);
};

export const sessionExists = async (cookie) => {

};

