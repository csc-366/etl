import { query, format } from './db2';
import {getCompleteMark, getPartialMarks, hasNoInvalidMarks} from "./marks";
import {getCompleteTags, getPartialTags, hasNoInvalidTags} from "./tags";

import {
   completeQueryString,
   completeTagsString,
   completeMarksString,
   groupBy, spreadTags, spreadMarks
} from '../models/export'

export async function getPendingObservations(count=-1, page=-1) {
   let pendingList;
   if (count < 0 || page < 0) {
       pendingList = await query(format("SELECT * FROM PendingObservations"));
   } else {
       pendingList = await query(format("SELECT * FROM PendingObservations" +
           " LIMIT ?,?", [parseInt(page), parseInt(count)]));
   }
   return pendingList[0];
}

export async function getPendingObservation(id) {
   const pendingObservation = (await query(format("SELECT * FROM PendingObservations WHERE ObservationId=?", [id])));
   return pendingObservation[0][0];
}

export const getPendingObservationsCount = async () => {
   let pendingCount = await query("SELECT COUNT(*) as count from PendingObservations");
   return pendingCount[0][0];
};

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
   const q = completeQueryString + ` WHERE s.FirstObservation = ${sealId}`;
   const completedObservations = (await query(q))[0];

   return (await combineWithTagsAndMarks(completedObservations))[0];
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

   await query(format(queryString, [observationId, sealId]));
}

export async function getObservations() {
   const completedObservations = (await query(completeQueryString))[0];

   return (await combineWithTagsAndMarks(completedObservations));
}

export const combineWithTagsAndMarks = async (completedObservations) => {
   const completedTags = groupBy((await query(completeTagsString))[0], 'ObservationId');
   const completedMarks = groupBy((await query(completeMarksString))[0], 'ObservationId');
   const fullObservations =  completedObservations.map(observation => {
      let tags = spreadTags(completedTags[observation.ID]);
      let marks = spreadMarks(completedMarks[observation.ID]);
      return {
         ...observation,
         Date: observation.Date ? new Date(observation.Date).toDateString() : null,
         FirstSeenAsWeanling: observation.FirstSeenAsWeanling ? new Date(observation.FirstSeenAsWeanling).toDateString() : null,
         ...marks,
         ...tags
      }
   });
   return fullObservations;
};