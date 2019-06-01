import { query, format, startTransaction, rollback} from './db2';
import { getCompleteMark, hasNoInvalidMarks, getPartialMarks } from "./markValidation";
import { getCompleteTags, hasNoInvalidTags, getPartialTags } from "./tagValidation";

export async function getPendingObservations(count, page) {
   let pendingList = await query(format("SELECT * FROM PendingObservations" +
   " LIMIT ?,?", [parseInt(page), parseInt(count)]));
   return pendingList[0];
}


export async function getCompleteIdentifiers(observation) {
   const tags = observation.tags;
   const marks = observation.marks;

   if (!await getPartialIdentifiers(observation)) {
      return false;
   }

   let tagNumArray = getCompleteTags(tags);
   let markNumArray = getCompleteMark(marks);

   if ((tagNumArray.length || markNumArray.length) && hasNoInvalidMarks(marks)
    && hasNoInvalidTags(tags)) {
      return {"completeTags": tagNumArray, "completeMarks": markNumArray}
   }

   return {"completeTags": [], "completeMarks": []}
}


export async function getPartialIdentifiers(body) {
   const date = new Date(body.date);
   const location = body.location;

   if (!date || !(await isValidDate(date))) {
      return false;
   }

   if (!location || !(await isValidLocation(location))){
      return false;
   }

   const tagNumArray = getPartialTags(body.tags);
   const markNumArray = getPartialMarks(body.marks);
   if ((tagNumArray.length || markNumArray.length) && hasNoInvalidMarks(body.marks)
    && hasNoInvalidTags(body.tags)) {
      return {"partialTags": tagNumArray, "partialMarks": markNumArray};
   }

   return {"partialTags": [], "partialMarks": []};
}


export async function isValidDate(date) {
   const observationYear = date.getFullYear();
   const currentYear = new Date().getFullYear();

   if (observationYear > currentYear || observationYear < 2017) {
      return false;
   }

   const result = (await query(format("SELECT * FROM Season WHERE Year = ?",
    [observationYear])))[0];
   const dateRange = result[0];

   return (date > dateRange.Start && date < dateRange.End);
}


export async function isValidLocation(location) {
   const result = (await query(format("SELECT * FROM Location WHERE Beach = ?",
    [location])))[0];

   if (result.length) {
      return true;
   } else {
      return false;
   }
}

export async function getSealObservations(sealId) {
   const queryString =
    "SELECT * From Observation O " +
      "JOIN SealObservation SO on SO.ObservationID = O.ID " +
      "JOIN Seal S on S.FirstObservation = SO.SealID " +
      "WHERE S.FirstObservation = ?";

   return (await query(format(queryString, [sealId])))[0];
}
