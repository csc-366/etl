import { query, format, startTransaction, rollback} from './db2';
import { hasCompleteMark, hasNoInvalidMarks, hasPartialMark } from "./markValidation";
import { hasCompleteTag, hasNoInvalidTags, hasPartialTag } from "./tagValidation";

export async function getPendingObservations(count, page) {
   let pendingList = await query(format("SELECT * FROM PendingObservations" +
   " LIMIT ?,?", [parseInt(page), parseInt(count)]));
   return pendingList[0];
}


export async function isValidObservation(body) {
   const tags = body.tags;
   const marks = body.marks;

   if (!await isValidPending(body)) {
      return false;
   }

   let matchTagNum = hasCompleteTag(tags);
   let matchMarkNum = hasCompleteMark(marks);
   if ((matchTagNum || matchMarkNum) && hasNoInvalidMarks(marks) && hasNoInvalidTags(tags)) {
      return {"tagNum": matchTagNum, "markNum": matchMarkNum}
   }

   return false;
}


export async function isValidPending(body) {
   const date = new Date(body.date);
   const location = body.location;

   if (!date || !(await isValidDate(date))) {
      return false;
   }

   if (!location || !(await isValidLocation(location))){
      return false;
   }

   if (!hasNoInvalidMarks(body.marks) || !hasNoInvalidTags(body.tags)) {
      return false;
   }

   return (hasPartialMark(body.marks) || hasPartialTag(body.tags));
}


export async function isValidDate(date) {
   const observationYear = date.getFullYear();
   const currentYear = new Date().getFullYear();

   if (observationYear > currentYear || observationYear < 2017) {
      return false;
   }

   const result = await query(format("SELECT * FROM Season WHERE Year = ?",
    [observationYear]));
   const dateRange = result[0][0];

   if (date < dateRange.Start || date > dateRange.End) {
      return false;
   }

   return true;
}


export async function isValidLocation(location) {
   const result = await query(format("SELECT * FROM Location WHERE Beach = ?",
    [location]));

   if (result[0] && result[0].length) {
      return true;
   }
   else {
      return false;
   }
}
