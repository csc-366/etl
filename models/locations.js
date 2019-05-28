import {query, format} from './db2';

export const addNewLocation = async (beach, beachName, rookery) => {
   const insertLocation = await query(format("INSERT INTO Location " +
    "(Beach, BeachName, Rookery) VALUES (?,?,?)", [beach, beachName, rookery]));
};

export const getExistingLocations = async () => {
   const locations = await query(format("SELECT * FROM Location"));
   return locations[0];
};
