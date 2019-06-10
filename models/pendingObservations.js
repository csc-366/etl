import {format, query} from "./db2";
import {appendQueryConditions} from "../utils/filtration";

export async function getPendingObservations(count, page) {
   let pendingList = await query(format("SELECT * FROM PendingObservations" +
    " LIMIT ?,?", [parseInt(page), parseInt(count)]));
   return pendingList[0];
}

export async function getPendingCount() {
   return (await query(format("SELECT COUNT(*) AS Count FROM" +
    " PendingObservations")))[0][0];
}

export async function insertPending(pendingObservation) {
   const queryString = "INSERT INTO PendingObservations SET ?";

   const formatted = format(queryString, pendingObservation);
   await query(formatted);
}

export async function getPendingWithFilters(filters) {
   let queryString = "SELECT * FROM PendingObservations ";

   let updatedQuery = appendQueryConditions('pending', queryString, filters);

   return (await query(updatedQuery))[0];
}