import fs from 'fs';
import csv from 'csv-parser';
const  shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

let names = [];
fs.createReadStream('names.csv')
    .pipe(csv(['name']))
    .on('data', (row) => {
        names.push(row.name)
    });
names = shuffle(names);

export const getName = () => {
    return names.pop();
};