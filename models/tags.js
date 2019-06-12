import {query, format} from "./db2";

const TAG_COLOR_REGEX = /[WBGPVRYO]/;
const TAG_NUMBER_REGEX = /[A-Z_][0-9_]{1,4}/;
const TAG_POSITION_REGEX = /(?:R|L)(?:[1-4])-S(?:i|o)/;
const COMPLETE_TAG_REGEX = /[WBGPVRYO][A-Z][0-9]{3}.*(?:R|L)(?:[1-4])-S(?:i|o)/;

export async function getTag(tagNum) {
   const queryString = "SELECT * From Tag WHERE Number = ?";
   const tag = (await query(format(queryString, [tagNum])))[0];

   return tag.length ? tag[0] : null;
}

export async function createNewTag(tagNum, color, position) {
   const queryString = "INSERT INTO Tag (Number, Color, Position) VALUES " +
    "(?,?,?)";

   await query(format(queryString, [tagNum, color, position]));
}

export async function insertTagObservation(observationId, tagNum) {
   const queryString = "INSERT INTO TagObservation " +
    "(ObservationId, TagNumber) VALUES (?,?)";

   await query(format(queryString, [observationId, tagNum]));
}


export async function insertTagDeployment(observationId, tagNum, sealId) {
   const queryString = "INSERT INTO TagDeployment " +
    "(ObservationId, TagNumber, SealId) VALUES (?,?,?)";

   await query(format(queryString, [observationId, tagNum, sealId]));
}

export async function insertTags(observationId, tags, sealId) {
   const existingTags = tags.filter(tag => !tag.isNew);
   const newTags = tags.filter(tag => tag.isNew);

   try {
      await insertExistingTags(observationId, existingTags);
      await insertNewTags(observationId, newTags, sealId);
   }
   catch (e) {
      throw e;
   }

}

async function insertExistingTags(observationId, existingTags) {
   for (let i = 0; i < existingTags.length; i++) {
      await insertTagObservation(observationId, existingTags[i].number);
   }
}

async function insertNewTags(observationId, newTags, sealId) {
   try {
      for (let i = 0; i < newTags.length; i++) {
         await createNewTag(newTags[i].number, newTags[i].color, newTags[i].position);
         await insertTagDeployment(observationId, newTags[i].number, sealId);
      }
   }
   catch (e) {
      throw new Error("Tag already exists in database")
   }
}

export function hasNoInvalidTags(tags) {
   if (!tags || !tags.length) {
      return true;
   }

   let validsOnly = true;

   tags.forEach((tag) => {
      if (!TAG_COLOR_REGEX.test(tag.color)) {
         validsOnly = false;
      } else if (tag.number.length !== 4 || !TAG_NUMBER_REGEX.test(tag.number)) {
         validsOnly = false;
      } else if (tag.position.length !== 5 || !TAG_POSITION_REGEX.test(tag.position)) {
         validsOnly = false;
      }
   });

   return validsOnly;
}

export function getPartialTags(tags) {
   if (!tags || !tags.length) {
      return [];
   }

   let partialMatches = [];

   // assume correct format, if any regx text fails, don't push to matches array
   tags.forEach((tag) => {
      let match = true;

      if (!TAG_COLOR_REGEX.test(tag.color)) {
         match = false;
      } else if (tag.number.length !== 4 || !TAG_NUMBER_REGEX.test(tag.number)) {
         match = false;
      } else if (tag.position.length !== 5 || !TAG_POSITION_REGEX.test(tag.position)) {
         match = false;
      }

      if (match) {
         partialMatches.push(tag.number)
      }
   });

   return partialMatches;
}

export function getCompleteTags(tags) {
   if (!tags || !tags.length) {
      return [];
   }

   let completeMatches = [];

   tags.forEach((tag) => {
      let fullTag = tag.color + tag.number + tag.position;

      if (COMPLETE_TAG_REGEX.test(fullTag)) {
         completeMatches.push(tag.number);
      }
   });

   return completeMatches;
}
