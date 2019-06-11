import * as CSV from 'csv-string';
import fs from 'fs';
import {promisify} from 'util';

const readFile = promisify(fs.readFile);
import * as _ from 'lodash';

export async function parse(filename) {
    const s = (await readFile(`./${filename}`)).toString();
    const unmappedData = CSV.parse(s, ',', '"');

    let headers = unmappedData[0];
    const mappedData = unmappedData.slice(1, unmappedData.length).map((row, index) => {
        let observation = row.reduce((acc, cur, idx) => {
            acc[headers[idx]] = cur ? cur : null;
            return acc
        }, {});
        observation.rowNumber = index + 2;
        return observation;
    });

    let errors = {};

    const processedData = mappedData.map(row => {
        let fieldLeaders, year, date, location, sex, age, pupCount, marks, tags, moltPercentage, season, measurement,
            lastSeenAsPup, firstSeenAsWeanling, rangeMS, range, comments, enteredInAno;
        try {
            fieldLeaders = row['Field Leader Initials'] ? row['Field Leader Initials'].split(',').map(leader => leader.trim()) : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "field leaders": e.message}
        }

        try {
            year = Number.parseInt(row['Year'].trim());
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "year": e.message}
        }

        try {
            date = jsDateToMySQLDate(new Date(row['Date'].trim()));
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "date": e.message}
        }

        try {
            if (!row['Loc.']) {
                errors[row.rowNumber] = {...errors[row.rowNumber], "location": "location cannot be empty"}
            } else {
                location = row['Loc.'].trim();
            }
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "location": e.message}
        }

        try {
            sex = row['Sex'] ? row['Sex'].trim() : null;
            if (!['M','F', null].includes(sex)) {
                errors[row.rowNumber] = {...errors[row.rowNumber], sex: "invalid sex"}
            }
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "sex": e.message}
        }

        try {
            age = row['Age'] ? row['Age'].trim() : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "ageClass": e.message}
        }

        try {
            pupCount = row['Pup?'] ? row['Pup?'].trim() : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "pupCount": e.message}
        }

        try {
            marks = parseMarks(row);
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "marks": e.message}
        }
        try {
            tags = parseTags(row);
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "tags": e.message}
        }

        try {
            moltPercentage = row['Molt (%)'] ? row['Molt (%)'].trim() : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "moltPercentage": e.message}
        }

        try {
            season = row['Season'] ? row['Season'].trim() : dateToSeason(new Date(date));
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "season": e.message}
        }

        try {
            measurement = parseMeasurement(row);
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "measurement":e.message}
        }

        try {
            lastSeenAsPup = row['Last seen as P'] ? new Date(row['Last seen as P'].trim()) : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "lastSeenAsPup":e.message}
        }

        try {
            firstSeenAsWeanling = row['First seen as W'] ? new Date(row['First seen as W'].trim()) : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "firstSeenAsWeanling":e.message}
        }

        try {
            rangeMS = lastSeenAsPup && firstSeenAsWeanling ? Math.abs(firstSeenAsWeanling.getTime() - lastSeenAsPup.getTime()) : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "rangeMS":e.message}
        }
        try {
            range = rangeMS ? Math.ceil(rangeMS / (1000 * 60 * 60 * 24)) : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "range":e.message}
        }

        try {
            comments = row['Comments'] ? row['Comments'].trim() : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "comments":e.message}
        }

        try {
            enteredInAno = row['Entered in Ano'] ? row['Entered in Ano'].trim() : null;
        } catch (e) {
            errors[row.rowNumber] = {...errors[row.rowNumber], "enteredInAno":e.message}
        }

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
            firstSeenAsWeanling,
            range,
            comments,
            enteredInAno,
            rowNumber
        }
    });

    return [processedData, errors]
}

const parseTags = (row) => {
    const tagHeaderRegex = /(?:New )?Tag ?([0-9]+) ?(.+)/;
    const tagRegex = /([WBGPVRYO])(.*)/;
    const completeTagRegex = /([WBGPVRYO])([^_]*)$/;
    const tags = Object.entries(row)
        .filter(([key]) => tagHeaderRegex.test(key))
        .reduce((agg, [key, value]) => {
            const matches = tagHeaderRegex.exec(key);
            if (_.isString(value)) {
                value = value.trim();
            }

            const tagIndex = matches[1];
            if (!agg[tagIndex]) {
                agg[tagIndex] = {tagNum: Number.parseInt(tagIndex)}
            }

            let tagComponent;
            switch (matches[2]) {
                case '?':
                    tagComponent = 'isNew';
                    value = value === 'Y';
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
                    const isComplete = completeTagRegex.test(value);
                    value = {color, number, isComplete};
                } else {
                    value = null;
                }
            }

            agg[tagIndex] = {...agg[tagIndex], [tagComponent]: value};

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
            if (_.isString(value)) {
                value = value.trim();
            }

            const markIndex = matches[1];

            let markComponent;
            switch (matches[2]) {
                case '?':
                    markComponent = 'isNew';
                    value = value === "Y";
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

const dateToSeason = (date) => {
    if (date.getMonth() === 12) {
        return date.getFullYear() + 1
    }
    return date.getFullYear();
};

const twoDigits = (d) => {
    if (0 <= d && d < 10)
        return `0${d}`;
    if (-10 < d && d < 0)
        return `-0${-1 * d}`;
    return d.toString();
};

export const jsDateToMySQLDate = (jsDate) => {
    return `${jsDate.getUTCFullYear()}-${twoDigits(jsDate.getUTCMonth() + 1)}-${twoDigits(jsDate.getUTCDate())}`
};

export function dump(c) {
    return CSV.stringify(c, ',')
}
