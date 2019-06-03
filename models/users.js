import {query, format} from './db2';
import {hash} from 'bcrypt';

const saltRounds = 10;

export const getUserByUsername = async (username) => {
   const selectStr = `SELECT * FROM User WHERE Username = (?)`;
   const selectQry = format(selectStr, username);

   let user = (await query(selectQry))[0];

   if (user.length === 0) {
      return null;
   }

   return user[0];
};

export const getAllUsers = async () => {
   let users = await query(format("SELECT * FROM User"));

   users[0].forEach((user) => {
      delete user.PasswordHash;
      delete user.PasswordSalt;
   });

   return users[0];
};

export const addUser = async (body) => {
   const insertStr = `INSERT INTO User (??,??,??,??,??,??,??) VALUES (?,?,?,?,?,?,?)`;
   const fields = ["Username", "FirstName", "LastName", "Email", "Role", "PasswordHash", "Status"];

   let values = [body.username, body.firstName, body.lastName,
    body.email, body.role];

   let user = await getUserByUsername(body.username);

   if (user) {
      return null; 
   }

   const hashString = await hash(body.password, saltRounds);
   values.push(hashString);
   values.push('Pending');

   const insertQry = format(insertStr, fields.concat(values));
   await query(insertQry);

   user = await getUserByUsername(body.username);
   console.log(user);
   return user;
};

export const setDBUserStatus = async (username, status) => {
   await query(format('UPDATE User SET Status = ? WHERE Username = ?',
       [status, username]))
};

export const acceptUser = async (username) => {
   await query(format('UPDATE User SET Status = ? WHERE Username = ?',
    ["Active", username]));
};

export const deactivateUser = async (username) => {
   await query(format('UPDATE User SET Status = ? WHERE Username = ?',
    ["Deactivated", username]));
};

