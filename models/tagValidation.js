const TAG_COLOR_REGEX = /[WBGPVRYO]/;
const TAG_NUMBER_REGEX = /[A-Z_][0-9_]{1,4}/;
const TAG_POSITION_REGEX = /(?:R|L)(?:[1-4])-S(?:i|o)/;
const COMPLETE_TAG_REGEX = /[WBGPVRYO][HPVXDNCUA][0-9]{3}.*(?:R|L)(?:[1-4])-S(?:i|o)/;


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
