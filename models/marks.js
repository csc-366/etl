import {query, format} from "./db2";

const MARK_NUMBER_REGEX1 = /^[WPBXHAVKOCM_]{1,3}[0-9_]{1,3}$/;
const MARK_NUMBER_REGEX2 = /^[0-9_]{1,3}[WPBXHAVKOCM_]{1,3}$/;
const COMPLETE_MARK_NUMBER_REGEX1 = /^[WPBXHAVKOCM]{1,3}[0-9]{1,3}$/;
const COMPLETE_MARK_NUMBER_REGEX2 = /^[0-9]{1,3}[WPBXHAVKOCM]{1,3}$/;
const MARK_POSITION_REGEX = /^[RLB]$/;

export async function getMark(markNum, season) {
   const queryString = "SELECT * From Mark WHERE Number = ? AND Season = ? ";
   const mark = (await query(format(queryString, [markNum, season])))[0];

   return mark.length ? mark[0] : null;
}

export async function createNewMark(markNum, season, position) {
   const queryString = "INSERT INTO Mark (Number, Season, Position)" +
    " VALUES (?,?,?)";

   const result = (await query(format(queryString, [markNum, season, position])));
   return result[0].insertId;
}

export async function insertMarkObservation(observationId, markId) {
   const queryString = "INSERT INTO MarkObservation (ObservationId, MarkId)" +
    " VALUES (?,?)";

   try {
      await query(format(queryString, [observationId, markId]));
   }
   catch (e) {
      throw e
   }
}

export async function insertMarkDeployment(observationId, markId, sealId) {
   const queryString = "INSERT INTO MarkDeployment " +
    "(ObservationId, MarkId, SealId) VALUES (?,?,?)";
   try {
      await query(format(queryString, [observationId, markId, sealId]));
   }
   catch (e) {
     throw e;
   }
}

export async function insertMarks(observationId, marks, season, sealId) {
   const existingMarks = marks.filter(mark => !mark.isNew);
   const newMarks = marks.filter(mark => mark.isNew);

   try {
      await insertExistingMarks(observationId, existingMarks, season);
      await insertNewMarks(observationId, newMarks, season, sealId);
   }
   catch (e) {
      throw e;
   }

}

async function insertExistingMarks(observationId, existingMarks, season) {
   for (let i = 0; i < existingMarks.length; i++) {
      let mark = await getMark(existingMarks[i].number, season);
      if (mark) {
         await insertMarkObservation(observationId, mark.ID);
      }
      else {
         throw new Error("Could not find existing mark");
      }
   }
}

async function insertNewMarks(observationId, newMarks, season, sealId) {
   try {
      for (let i = 0; i < newMarks.length; i++) {
         let markId = await createNewMark(newMarks[i].number, season, newMarks[i].position);
         await insertMarkDeployment(observationId, markId, sealId);
      }
   }
   catch (e) {
      throw new Error("Mark already exists in database")
   }
}

export function hasNoInvalidMarks(marks) {
   if (!marks || !marks.length) {
      return true;
   }

   let validsOnly = true;

   marks.forEach((mark) => {
      if (mark.number.length < 1 || mark.number.length > 6 ||
       (!MARK_NUMBER_REGEX1.test(mark.number) && !MARK_NUMBER_REGEX2.test(mark.number))) {
         validsOnly = false;
      } else if (mark.position && !MARK_POSITION_REGEX.test(mark.position)) {
         validsOnly = false;
      }
   });

   return validsOnly;
}

export function getPartialMarks(marks) {
   if (!marks || !marks.length) {
      return [];
   }

   let partialMatches = [];

   marks.forEach((mark) => {
      let match = true;

      if (mark.number.length < 1 || mark.number.length > 6 ||
       (!MARK_NUMBER_REGEX1.test(mark.number) && !MARK_NUMBER_REGEX2.test(mark.number))) {
         match = false;
      } else if (mark.position && !MARK_POSITION_REGEX.test(mark.position)) {
         match = false;
      }

      if (match) {
         partialMatches.push(mark.number);
      }
   });

   return partialMatches;
}

export function getCompleteMark(marks) {
   if (!marks || !marks.length) {
      return [];
   }

   let completeMatches = [];

   marks.forEach((mark) => {
      if (COMPLETE_MARK_NUMBER_REGEX1.test(mark.number) ||
       COMPLETE_MARK_NUMBER_REGEX2.test(mark.number)) {
         completeMatches.push(mark.number);
      }
   });

   return completeMatches;
}

