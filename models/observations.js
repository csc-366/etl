import {query, format} from './db2';
import {hash} from 'bcrypt';

export async function getPendingObservations(count, page) {
   const selectQry = `SELECT * FROM PendingObservations LIMIT ${page},${count}`;

   console.log(selectQry);
   let pendingList = await query(selectQry);

   return pendingList[0];
}