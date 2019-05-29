import { query, format, startTransaction, rollback} from './db2';
import {ingestTags} from "./etl/tag";
import {ingestMarks} from "./etl/mark";

export async function getPendingObservations(count, page) {
   let pendingList = await query(format("SELECT * FROM PendingObservations" +
   " LIMIT ?,?", [parseInt(page), parseInt(count)]));
   return pendingList[0];
}

export async function isValidObservation(body) {
   const tags = body.tags;
   const marks = body.marks;

   if (!(await isValidPending(body))) {
      return false;
   }
   if ((!tags || !tags.length) && (!marks || !marks.length)) {
      return false;
   }
   if (!(await hasNoInvalidTags(tags))) {
      return false;
   }
   if (!(await hasNoInvalidMarks(marks))) {
      return false;
   }
// TODO: more robust checking with a transaction to insert the entire req body
   return true;
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
   console.log("valid pending");
   return true;
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

   console.log("valid date");
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

export async function hasNoInvalidTags(tags) {
   if (!tags || tags.length === 0) {
      return true;
   }

   const connection = await startTransaction();

   try {
      let insertedTags = await ingestTags({tags, connection});
      console.log(insertedTags);
      return true;
   }
   catch (e) {
      return false;
   }
   finally {
      await rollback(connection);
   }
}

export async function hasNoInvalidMarks(marks) {
   if (!marks || marks.length === 0) {
      return true;
   }

   const connection = await startTransaction();

   try {
      let insertedMarks = await ingestMarks({marks, connection});
      return true;
   }
   catch (e) {
      return false;
   }
   finally {
      await rollback(connection);
   }
}
