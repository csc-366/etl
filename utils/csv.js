import * as CSV from 'csv-string';
import fs from 'fs';
import * as _ from 'lodash';

/*
const headers = [
    'fieldLeaders',
    'year',
    'date',
    'location',
    'sex',
    'age',
    'pupCount',
    'newMarkOne',
    'markOne',
    'markOnePosition',
    'newMarkTwo',
    'markTwo',
    'markTwoPosition',
    'newTagOne',
    'tagOne',
    'tagOnePosition',
    'newTagTwo',
    'tagTwo',
    'tagTwoPosition',
    'moltPercentage',
    'season',
    'standardLength',
    'curvilinearLength',
    'axillaryGirth',
    'mass',
    'tare',
    'massTare',
    'lastSeenAsPup',
    'firstSeenAsWeaner',
    'range',
    'comments',
    'enteredInAno'
];
*/

export function parse(filename) {
    const s = fs.readFileSync(`./${filename}`).toString();
    const unmappedData = CSV.parse(s, ',', '"');

    let headers = unmappedData[0];
    const mappedData = unmappedData.slice(1, unmappedData.length).map((row, index) => {
        let observation = row.reduce((acc, cur, idx) => {
            acc[headers[idx]] = cur ? cur : null;
            return acc
        }, {});
        observation.rowNumber = index + 1;
        return observation;
    });

    const processedData = mappedData.map(row => {
        const fieldLeaders = row['Field Leader Initials'] ? row['Field Leader Initials'].split(',').map(leader => leader.trim()) : null;

        const year = row['Year'];

        const date = jsDateToMySQLDate(new Date(row['Date']));

        const location = row['Loc.'];

        const sex = row['Sex'];

        const age = row['Age'];

        const pupCount = row['Pup?'];

        const marks = parseMarks(row);
        const tags = parseTags(row);

        const moltPercentage = row['Molt (%)'];

        const season = row['Season'];

        const measurement = parseMeasurement(row);

        const lastSeenAsPup = row['Last seen as P'] ? new Date(row['Last seen as P']) : null;

        const firstSeenAsWeaner = row['First seen as W'] ? new Date(row['First seen as W']) : null;

        const rangeMS = lastSeenAsPup && firstSeenAsWeaner ? Math.abs(firstSeenAsWeaner.getTime() - lastSeenAsPup.getTime()) : null;
        const range = rangeMS ? Math.ceil(rangeMS / (1000 * 60 * 60 * 24)) : null;

        const comments = row['Comments'];

        const enteredInAno = row['Entered in Ano'];

        const rowNumber = row.rowNumber;

        return {
            fieldLeaders,
            year,
            date,
            location,
            sex,
            age,
            pupCount,
            marks,
            tags,
            moltPercentage,
            season,
            measurement,
            lastSeenAsPup,
            firstSeenAsWeaner,
            range,
            comments,
            enteredInAno,
            rowNumber
        }
    });

    return processedData
}

const parseTags = (row) => {
    const tagHeaderRegex = /(?:New )?Tag ?([0-9]+) ?(.+)/;
    const tagRegex = /([WBGPVRYO])(.*)/;
    const tags = Object.entries(row)
        .filter(([key]) => {
            return tagHeaderRegex.test(key)
        }).reduce((agg, [key, value]) => {
            const matches = tagHeaderRegex.exec(key);

            const tagIndex = matches[1];

            let tagComponent;
            switch (matches[2]) {
                case '?':
                    tagComponent = 'isNew';
                    break;
                case '#':
                    tagComponent = 'tag';
                    break;
                case 'Pos.':
                case 'Pos. ':
                    tagComponent = 'position';
                    break;
                default:
                    console.log(matches);
                    throw new Error("invalid match for tag component");
            }

            if (tagComponent === 'tag') {
                if (tagRegex.test(value)) {
                    const [, color, number] = tagRegex.exec(value);
                    value = {color, number};
                } else {
                    value = null;
                }
            }

            if (Object.keys(agg).includes(tagIndex)) {
                agg[tagIndex] = {...agg[tagIndex], [tagComponent]: value};
            } else {
                agg[tagIndex] = {[tagComponent]: value}
            }

            if (Object.values(agg[tagIndex]).filter(item => item).length === 0) {
                agg[tagIndex] = undefined;
            }

            return agg;
        }, {});

    return Object.values(tags).filter(item => item);
};

const parseMarks = (row) => {
    const markRegex = /(?:New )?Mark ([0-9]+) ?(.*)/;
    const marks = Object.entries(row)
        .filter(([key]) => {
            return markRegex.test(key)
        }).reduce((agg, [key, value]) => {
            const matches = markRegex.exec(key);

            const markIndex = matches[1];

            let markComponent;
            switch (matches[2]) {
                case '?':
                    markComponent = 'isNew';
                    break;
                case '':
                    markComponent = 'mark';
                    break;
                case 'Position ':
                case 'Position':
                    markComponent = 'position';
                    break;
                default:
                    throw new Error("invalid match for mark component")
            }

            if (Object.keys(agg).includes(markIndex)) {
                agg[markIndex] = {...agg[markIndex], [markComponent]: value};
            } else {
                agg[markIndex] = {[markComponent]: value};
            }

            if (Object.values(agg[markIndex]).filter(item => item).length === 0) {
                agg[markIndex] = undefined;
            }

            return agg
        }, {});

    return Object.values(marks).filter(item => item);
};

const parseMeasurement = (row) => {
    return {
        standardLength: row['St. Length'],
        curvilinearLength: row['Crv. Length'],
        axillaryGirth: row['Ax. Girth'],
        totalMass: row['Mass'],
        massTare: row['Tare'],
        animalMass: row['Mass-Tare']
    }
};

const twoDigits = (d) => {
    if (0 <= d && d < 10)
        return `0${d}`;
    if (-10 < d && d < 0)
        return `-0${-1*d}`;
    return d.toString();
};

export const jsDateToMySQLDate = (jsDate) => {
    return `${jsDate.getUTCFullYear()}-${twoDigits(jsDate.getUTCMonth() + 1)}-${twoDigits(jsDate.getUTCDate())}`
};

export function dump(c) {
    return CSV.stringify(c, ',')
}
