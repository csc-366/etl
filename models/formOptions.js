import {query, format} from './db2';

export const addNewLocation = async (beach, beachName, rookery) => {
   const insertLocation = await query(format("INSERT INTO Location " +
    "(Beach, BeachName, Rookery) VALUES (?,?,?)", [beach, beachName, rookery]));
};

export const delLocation = async (beach) => {
   let result = await query(format("DELETE FROM Location WHERE " +
    "Beach = ?", [beach]));

   return result[0].affectedRows;
};

export const getExistingLocations = async () => {
   const locations = await query(format("SELECT * FROM Location"));
   return locations[0];
};


export const addNewColor = async (color, colorName) => {
   const insertColor = await query(format("INSERT INTO TagColor " +
    "(Color, ColorName) VALUES (?,?)", [color, colorName]));
};

export const delColor = async (color) => {
   let result = await query(format("DELETE FROM TagColor WHERE " +
    "Color = ?", [color]));

   return result[0].affectedRows;
};

export const getExistingColors = async () => {
   const colors = await query(format("SELECT * FROM TagColor"));
   return colors[0];
};


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

export const delTagPosition = async (position) => {
   let result = await query(format("DELETE FROM TagPosition WHERE " +
    "Position = ?", [position]));

   return result[0].affectedRows;
};

export const getExistingTagPositions = async () => {
   const positions = await query(format("SELECT * FROM TagPosition"));
   return positions[0];
};


export const addNewRookery = async (rookery, rookeryName) => {
   await query(format("INSERT INTO Rookery (Rookery, RookeryName) " +
       "VALUES (?,?)", [rookery, rookeryName]));
};

export const delRookery = async (rookery) => {
   let result = await query(format("DELETE FROM Rookery WHERE " +
    "Rookery = ?", [rookery]));

   return result[0].affectedRows;
};

export const getExistingRookeries = async () => {
   return (await query(format("SELECT * FROM Rookery")))[0];
};


export const addNewAgeClass = async (shortName, fullName) => {
   await query(format("INSERT INTO AgeClass (ShortName, FullName) " +
       "VALUES (?,?)", [shortName, fullName]));
};

export const delAgeClass = async (shortName) => {
   let result = await query(format("DELETE FROM AgeClass WHERE " +
    "ShortName = ?", [shortName]));

   return result[0].affectedRows;
};

export const getExistingAgeClasses = async () => {
   console.log('getting ageclasses')
   return (await query(format("SELECT * FROM AgeClass")))[0];
};


export const addNewAffiliation = async (affiliation, description) => {
   if (description) {
      await query(format("INSERT INTO Affiliation (Affiliation, Description) " +
       "VALUES (?,?)", [affiliation, description]));
   }
   else {
      await query(format("INSERT INTO Affiliation (Affiliation) VALUES (?)",
       [affiliation]));
   }
};

export const delAffiliation = async (affiliation) => {
   let result = await query(format("DELETE FROM Affiliation WHERE " +
    "Affiliation = ?", [affiliation]));

   return result[0].affectedRows;
};

export const getExistingAffiliations = async () => {
   console.log('getting affiliation')
   return (await query(format("SELECT * FROM Affiliation")))[0];
};
