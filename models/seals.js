import {query, checkQuery, format} from './db2';

export async function getSealFromTag(tagNumber) {
   console.log('getting seal from tag')
   let sealId = (await query(format("SELECT SealId FROM TagDeployment WHERE " +
    "TagNumber = (?)", [tagNumber])))[0];

   if (sealId.length) {
      return sealId[0];
   }

   return null;
}

export async function getSealFromMark(markNumber, season) {
   let markId = (await query(format("SELECT * FROM ?? WHERE" +
    " (Number, Season) = (?,?)", ["Mark", markNumber, season])))[0][0];

   if (!markId || !markId.ID) {
      return null;
   }

   let sealId = (await query(format("SELECT SealId FROM MarkDeployment WHERE " +
    "MarkId = (?)", [markId.ID])))[0];

   if (sealId.length) {
      return sealId[0];
   }

   return null;
}
