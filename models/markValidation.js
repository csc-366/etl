const MARK_NUMBER_REGEX1 = /^[WPBXHAVKOCM_]{1,3}[0-9_]{1,3}$/;
const MARK_NUMBER_REGEX2 = /^[0-9_]{1,3}[WPBXHAVKOCM_]{1,3}$/;
const COMPLETE_MARK_NUMBER_REGEX1 = /^[WPBXHAVKOCM]{1,3}[0-9]{1,3}$/;
const COMPLETE_MARK_NUMBER_REGEX2 = /^[0-9]{1,3}[WPBXHAVKOCM_]{1,3}$/;
const MARK_POSITION_REGEX = /^[RLB]$/;


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

