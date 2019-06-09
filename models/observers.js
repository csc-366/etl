import { query, format, startTransaction, rollback} from './db2';

export async function getObserver(email) {
   const observer = (await query(format("SELECT * FROM Observer WHERE" +
    " Email = ?", [email])))[0];

   return (observer.length) ? observer[0] : null;
}

export async function insertObserver(email) {
   await query(format("INSERT INTO Observer (email) VALUES (?)", [email]))
}
