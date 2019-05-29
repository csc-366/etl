import {query, checkQuery, format} from './db2';

export async function getSealsFromTag(tag) {
   let sealId = (await query(format("SELECT SealId FROM TagDeployment WHERE " +
    "TagNumber = (?)", [tag])))[0];

   if (sealId.length) {
      return sealId[0];
   }

   return null;
}

export async function getSealsFromMark(mark) {
   let sealId = (await query(format("SELECT SealId FROM MarkDeployment WHERE " +
    "MarkId = (?)", [mark])))[0];

   if (sealId.length) {
      return sealId[0];
   }

   return null;
}
