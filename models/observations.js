import { query, format, startTransaction, rollback} from './db2';
import { getCompleteMark, hasNoInvalidMarks, getPartialMarks } from "./marks";
import { getCompleteTags, hasNoInvalidTags, getPartialTags } from "./tags";

export async function getPendingObservations(count, page) {
   let pendingList = await query(format("SELECT * FROM PendingObservations" +
   " LIMIT ?,?", [parseInt(page), parseInt(count)]));
   return pendingList[0];
}

export async function getPendingCount() {
   return (await query(format("SELECT COUNT(*) AS Count FROM" +
    " PendingObservations")))[0][0];
}

export async function getCompleteIdentifiers(observation) {
   const tags = observation.tags;
   const marks = observation.marks;

   let {partialTags, partialMarks} = await getPartialIdentifiers(observation);

   // since complete tags are basically a 'sub-category' of partial tags, if
   // there are no partial tags, there must be no complete tags
   if (!partialTags.length && !partialMarks.length) {
      return {"completeTags": [], "completeMarks": []}
   }

   let tagNumArray = getCompleteTags(tags);
   let markNumArray = getCompleteMark(marks);

   if ((tagNumArray.length || markNumArray.length) && hasNoInvalidMarks(marks)
    && hasNoInvalidTags(tags)) {
      return {"completeTags": tagNumArray, "completeMarks": markNumArray}
   }

   return {"completeTags": [], "completeMarks": []}
}


export async function getPartialIdentifiers(observation) {
   const date = new Date(observation.date);
   const location = observation.location;

   if (!date || !(await isValidDate(date))) {
      return {"partialTags": [], "partialMarks": []};
   }

   if (!location || !(await isValidLocation(location))){
      return {"partialTags": [], "partialMarks": []};
   }

   const tagNumArray = getPartialTags(observation.tags);
   const markNumArray = getPartialMarks(observation.marks);
   if ((tagNumArray.length || markNumArray.length) && hasNoInvalidMarks(observation.marks)
    && hasNoInvalidTags(observation.tags)) {
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

   return (result.length) ? true : false;
}

export async function getSealObservations(sealId) {
   const queryString =
    "SELECT O.* From Observation O " +
      "JOIN SealObservation SO on SO.ObservationID = O.ID " +
      "JOIN Seal S on S.FirstObservation = SO.SealID " +
      "WHERE S.FirstObservation = ?";

   return (await query(format(queryString, [sealId])))[0];
}

export async function insertObservation(obs, submitterName) {
   // optional fields must be set to null in case they are undefined
   const observer = obs.observer ? obs.observer : null;
   const ageClass = obs.ageClass ? obs.ageClass : null;
   const moltPercentage = obs.moltPercentage ? obs.moltPercentage : null;
   const comments = obs.comments ? obs.comments : null;

   const queryString =
    "INSERT INTO Observation (Date, Location, SubmittedBy, Observer, AgeClass, " +
    "MoltPercentage, Comments) VALUES (?,?,?,?,?,?,?)";

   const result = await query(format(queryString, [obs.date, obs.location, submitterName,
      observer, ageClass, moltPercentage, comments]));

   return result[0].insertId;
}

export async function insertSealObservation(observationId, sealId) {
   const queryString = "INSERT INTO SealObservation " +
    "(ObservationId, SealId) VALUES (?,?)";

   await query(format(queryString, [observationId, sealId]));}
