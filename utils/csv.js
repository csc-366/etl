import * as CSV from 'csv-string';
import fs from 'fs';

export function parse(filename) {
    const s = fs.readFileSync(`./${filename}`).toString();
    const unmappedData = CSV.parse(s, ',', '"');
    const headers = unmappedData[0];
    return unmappedData.slice(1,unmappedData.length).map((row) => {
        return row.reduce((acc, cur, idx) => {
            acc[headers[idx]] = cur ? cur : null;
            return acc
        }, {});
    });
}

export function dump(c) {
    return CSV.stringify(c, ',')
}
