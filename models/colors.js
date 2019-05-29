import {query, format} from './db2';

export const addNewColor = async (color, colorName) => {
   const insertColor = await query(format("INSERT INTO TagColor " +
    "(Color, ColorName) VALUES (?,?)", [color, colorName]));
};

export const getExistingColors = async () => {
   const colors = await query(format("SELECT * FROM TagColor"));
   return colors[0];
};
