import { query, format, startTransaction, rollback} from './db2';

export async function getObserver(username) {
   const observer = (await query(format("SELECT * FROM Observer WHERE" +
    " Username = ?", [username])))[0];

   return (observer.length) ? observer[0] : null;
}

export async function insertObserver(username) {
   await query(format("INSERT INTO Observer (Username) VALUES (?)", [username]))
}
