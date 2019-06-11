import { query, format, startTransaction, rollback} from './db2';

export async function insertPupAge(observationId, pupAge) {
   const queryString = "INSERT INTO PupAge (ObservationId, Age) VALUES (?,?)";

   if (isNaN(pupAge) || pupAge < 0) {
      return;
   }

   await query(format(queryString, [observationId, pupAge]));
}

export async function insertPupCount(observationId, pupCount) {
   const queryString = "INSERT INTO PupCount (ObservationId, Count) VALUES (?,?)";

   if (isNaN(pupCount) || pupCount < 0 || pupCount > 10) {
      return;
   }

   await query(format(queryString, [observationId, pupCount]));
}

