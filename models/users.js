import {query, format} from './db';

export const addUser = async (body) => {
   const selectStr = `SELECT * FROM User WHERE Username = (?)`;
   const insertStr = `INSERT INTO User (Username) VALUES (?)`;
   const selectQry = format(selectStr, body.username);
   const insertQry = format(insertStr, body.username);

   let user = await query(selectQry);

   if (user[0].length !== 0) {
      return null;
   }

   await query(insertQry);
   user = await query(selectQry)[0];

   return user;
}
