import {query, format} from './db2';

export const addNewLocation = async (beach, beachName, rookery) => {
   const insertLocation = await query(format("INSERT INTO Location " +
    "(Beach, BeachName, Rookery) VALUES (?,?,?)", [beach, beachName, rookery]));
};

export const getExistingLocations = async () => {
   const locations = await query(format("SELECT * FROM Location"));
   return locations[0];
};

export const addNewColor = async (color, colorName) => {
   const insertColor = await query(format("INSERT INTO TagColor " +
    "(Color, ColorName) VALUES (?,?)", [color, colorName]));
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

export const getAllTagPositions = async () => {
   const positions = await query(format("SELECT * FROM TagPosition"));
   return positions[0];
};


export const getExistingRookeries = async () => {
   console.log('getting rookeries')
   return (await query(format("SELECT * FROM Rookery")))[0];
};

export const addRookery = async (rookery, rookeryName) => {
   await query(format("INSERT INTO Rookery (Rookery, RookeryName) " +
       "VALUES (?,?)", [rookery, rookeryName]));
};

export const getExistingAgeClasses = async () => {
   console.log('getting ageclasses')
   return (await query(format("SELECT * FROM AgeClass")))[0];
};

export const addAgeClass = async (shortName, fullName) => {
   await query(format("INSERT INTO AgeClass (ShortName, FullName) " +
       "VALUES (?,?)", [shortName, fullName]));
};

export const getExistingAffiliations = async () => {
   console.log('getting affiliation')
   return (await query(format("SELECT * FROM Affiliation")))[0];
};

export const addAffiliation = async (affiliation, description) => {
   if (description) {
      await query(format("INSERT INTO Affiliation (Affiliation, Description) " +
       "VALUES (?,?)", [affiliation, description]));
   }
   else {
      await query(format("INSERT INTO Affiliation (Affiliation) VALUES (?)",
       [affiliation]));
   }
};
