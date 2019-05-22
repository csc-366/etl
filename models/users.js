import {query, format} from './db2';
import {hash} from 'bcrypt';

const saltRounds = 10;

export const getUserByUsername = async (username) => {
   const selectStr = `SELECT * FROM User WHERE Username = (?)`;
   const selectQry = format(selectStr, username);

   let user = await query(selectQry);

   if (user[0] && (user[0].length === 0)) {
      return null;
   }

   return user[0] && user[0][0];
};

export const addUser = async (body) => {
   const insertStr = `INSERT INTO User (??,??,??,??,??,??) VALUES (?,?,?,?,?,?)`;
   const fields = ["Username", "FirstName", "LastName", "Email", "Role", "PasswordHash"];

   let values = [body.username, body.firstName, body.lastName,
    body.email, body.role];

   let user = await getUserByUsername(body.username);

   if (user) {
      return null; 
   }

   const hashString = await hash(body.password, saltRounds);
   values.push(hashString);

   const insertQry = format(insertStr, fields.concat(values));
   await query(insertQry);

   user = await getUserByUsername(body.username);
   return user;
};
