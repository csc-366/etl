import {query, format} from './db2';

export const addNewTagPosition = async (position, natPosition, description) => {
   if (description) {
      const insertPosition = await query(format("INSERT INTO TagPosition " +
       "(Position, NationalTagPosition, Description) VALUES (?,?,?)",
       [position, natPosition, description]));
   }
   else {
      const insertPosition = await query(format("INSERT INTO TagPosition " +
       "(Position, NationalTagPosition) VALUES (?,?)",
       [position, natPosition]));
   }
};

export const getAllTagPositions = async () => {
   const positions = await query(format("SELECT * FROM TagPosition"));
   return positions[0];
};