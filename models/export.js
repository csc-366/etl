import {query} from "./db2";
import {getPendingObservation} from "./observations";

export const exportPendingCSV = async () => {
    const pendingObservations = (await query("SELECT * FROM PendingObservations"))[0];
    const pendingObservationsHeaders = Object.keys(pendingObservations[0]);
    const headerString = `${pendingObservationsHeaders.join(',')}\n`;
    return pendingObservations.reduce((agg, observation) => {
        const observationValues = Object.values(observation).map(o => {
            if (typeof o === 'string') {
                return `'${o}'`
            }
            return o;
        }).join(',');
        return `${agg}${observationValues}\n`;
    }, headerString);
};

const getCompletedMarks = async () => {
    const completedMarks = groupBy((await query(completeMarksString))[0], 'ObservationId');
    const mappedMarks = Object.entries(completedMarks).reduce((agg, [observation, marks]) => {
        const markValues = [];
        if (marks.length > 0) {
            const newMark = marks[0].NewMark ? !!marks[0].NewMark : '';
            const markNumber = marks[0].Number ? marks[0].Number : '';
            const markPosition = marks[0].Position ? marks[0].Position : '';
            markValues.push(newMark, markNumber, markPosition)
        } else {
            markValues.push('', '', '');
        }
        if (marks.length > 1) {
            const newMark = marks[1].NewMark ? !!marks[1].NewMark : '';
            const markNumber = marks[1].Number ? marks[1].Number : '';
            const markPosition = marks[1].Position ? marks[1].Position : '';
            markValues.push(newMark, markNumber, markPosition)
        } else {
            markValues.push('', '', '');
        }
        return {
            ...agg,
            [observation]: markValues.join(',')
        }
    }, {});
    return mappedMarks;
};

const getCompletedTags = async () => {
    const completedTags = groupBy((await query(completeTagsString))[0], 'ObservationId');
    const mappedTags = Object.entries(completedTags).reduce((agg, [observation, tags]) => {
        const tagValues = [];
        if (tags.length > 0) {
            const newTag = tags[0].NewTag ? !!tags[0].NewTag : '';
            const tagNumber = tags[0].Number ? tags[0].Number : '';
            const tagPosition = tags[0].Position ? tags[0].Position : '';
            tagValues.push(newTag, tagNumber, tagPosition)
        } else {
            tagValues.push('', '', '');
        }
        if (tags.length > 1) {
            const newTag = tags[1].NewTag ? !!tags[1].NewTag : '';
            const tagNumber = tags[1].Number ? tags[1].Number : '';
            const tagPosition = tags[1].Position ? tags[1].Position : '';
            tagValues.push(newTag, tagNumber, tagPosition)
        } else {
            tagValues.push('', '', '');
        }
        return {
            ...agg,
            [observation]: tagValues.join(',')
        }
    }, {});
    return mappedTags;
};

export const exportCompletedCSV = async () => {
    const completedObservations = (await query(completeQueryString))[0];
    const completedMarks = await getCompletedMarks();
    const completedTags = await getCompletedTags();
    const completedObservationsHeaders = Object.keys(completedObservations[0]);
    const headerString = `${completedObservationsHeaders.join(',')},NewTag1,Tag1Number,Tag1Position,NewTag2,Tag2Number,Tag2Position,NewMark1,Mark1,Mark1Position,NewMark2,Mark2,Mark2Position\n`;
    const observations = completedObservations.map(observation => {
        const quotedObservation = Object.entries(observation).map(([key, value]) => {
            if (value === undefined || value === 'undefined') {
                console.log('Undefined', typeof value);
            }
            if (!value) {
                return ''
            }
            if (typeof value === 'string') {
                return `'${value}'`
            } else {
                return value
            }
        }).join(',');
        return quotedObservation + completedTags[observation.ID] + completedMarks[observation.ID];
    }).join('\n');
    return headerString + observations
};

const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

const completeQueryString = "SELECT o.ID,\n" +
    "       f.Leaders,\n" +
    "       o.Year,\n" +
    "       o.Date,\n" +
    "       o.Location,\n" +
    "       s.Sex      as Sex,\n" +
    "       o.AgeClass as Age,\n" +
    "       pc.Count,\n" +
    "       o.Season,\n" +
    "       m.*,\n" +
    "       fsaw.FirstSeenAsWeanling,\n" +
    "       o.Comments\n" +
    "FROM (SELECT *\n" +
    "      FROM ((SELECT ID, Date, YEAR(Date) as Year, YEAR(Date) as Season, Location, AgeClass, MoltPercentage, Comments\n" +
    "             FROM Observation\n" +
    "             WHERE MONTH(Date) <> 12)\n" +
    "            UNION DISTINCT (SELECT ID,\n" +
    "                                   Date,\n" +
    "                                   YEAR(Date)     as Year,\n" +
    "                                   YEAR(Date) + 1 as Season,\n" +
    "                                   Location,\n" +
    "                                   AgeClass,\n" +
    "                                   MoltPercentage,\n" +
    "                                   Comments\n" +
    "                            FROM Observation\n" +
    "                            WHERE MONTH(Date) = 12)) Observations) o\n" +
    "       LEFT JOIN (SELECT ObservationId, GROUP_CONCAT(Leader SEPARATOR ',') as Leaders\n" +
    "                  FROM FieldLeader\n" +
    "                  GROUP BY ObservationId) f ON o.ID = f.ObservationId\n" +
    "       LEFT JOIN PupCount pc ON o.ID = pc.ObservationId\n" +
    "       LEFT JOIN Measurement m ON o.ID = m.ObservationId\n" +
    "       LEFT JOIN SealObservation so ON so.ObservationId = o.ID\n" +
    "       LEFT JOIN Seal s ON s.FirstObservation = so.SealId\n" +
    "       LEFT JOIN (SELECT s.FirstObservation, MIN(o.Date) as `FirstSeenAsWeanling`\n" +
    "                  FROM Observation o,\n" +
    "                       Seal s,\n" +
    "                       SealObservation so\n" +
    "                  WHERE o.ID = so.ObservationId\n" +
    "                    AND so.SealId = s.FirstObservation\n" +
    "                    AND o.AgeClass = 'W'\n" +
    "                  GROUP BY s.FirstObservation) fsaw ON fsaw.FirstObservation = so.SealId";

const completeTagsString = "SELECT TagObservations.ObservationId, TagObservations.NewTag, CONCAT(Tag.Color, Tag.Number) as Number, Tag.Position\n" +
    "FROM ((SELECT ObservationId, TagNumber, TRUE as NewTag FROM TagDeployment)\n" +
    "      UNION DISTINCT (SELECT *, FALSE AS NewTag FROM TagObservation)) TagObservations\n" +
    "       LEFT JOIN Tag ON TagObservations.TagNumber = Tag.Number";
const completeMarksString = "SELECT MarkObservations.ObservationId, MarkObservations.NewMark, Mark.Number, Mark.Position\n" +
    "FROM ((SELECT ObservationId, MarkId, TRUE as NewMark FROM MarkDeployment)\n" +
    "      UNION DISTINCT (SELECT *, FALSE as NewMark FROM MarkObservation)) MarkObservations\n" +
    "       LEFT JOIN Mark ON MarkObservations.MarkId = Mark.ID";