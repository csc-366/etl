import {query} from "./db2";
import stringify from 'csv-stringify';
const options = {
    delimiter: ',',
    header: true
};

export const exportPending = async (format='csv') => {
    const pendingObservations = (await query("SELECT * FROM PendingObservations"))[0];
    const fullObservations = pendingObservations.map(observation => {
        return {
            ...observation,
            Date: observation.Date ? new Date(observation.Date).toDateString() : null,
            FirstSeenAsWeanling: observation.FirstSeenAsWeanling ? new Date(observation.FirstSeenAsWeanling).toDateString() : null
        }
    });
    return format === 'csv' ? stringify(fullObservations, options) : fullObservations;
};

export const exportCompleted = async (format='csv') => {
    const completedObservations = (await query(completeQueryString))[0];
    const completedTags = groupBy((await query(completeTagsString))[0], 'ObservationId');
    const completedMarks = groupBy((await query(completeMarksString))[0], 'ObservationId');
    const fullObservations = completedObservations.map(observation => {
        let tags = completedTags[observation.ID];
        let marks = completedMarks[observation.ID];
        if (format === 'csv') {
            tags = spreadTags(completedTags[observation.ID]);
            marks = spreadMarks(completedMarks[observation.ID]);
        }
        console.log(observation);
        return {
            ...observation,
            Date: observation.Date ? new Date(observation.Date).toDateString() : null,
            FirstSeenAsWeanling: observation.FirstSeenAsWeanling ? new Date(observation.FirstSeenAsWeanling).toDateString() : null,
            ...marks,
            ...tags
        }
    });
    return format === 'csv' ? stringify(fullObservations, options) : fullObservations;
};

const spreadMarks = (values) => {
    if (!values) {
        return {
            NewMark1: null,
            Mark1Number: null,
            Mark1Position: null,
            NewMark2: null,
            Mark2Number: null,
            Mark2Position: null
        }
    } else if(values.length === 1) {
        let newMark1;
        switch(values[0].NewMark) {
            case 1:
                newMark1 = 'Yes';
                break;
            case 0:
                newMark1 = 'No';
                break;
            default:
                newMark1 = null;
        }
        return {
            NewMark1: newMark1,
            Mark1Number: values[0].Number,
            Mark1Position: values[0].Position,
            NewMark2: null,
            Mark2Number: null,
            Mark2Position: null
        }
    } else {
        let newMark1;
        switch(values[0].NewMark) {
            case 1:
                newMark1 = 'Yes';
                break;
            case 0:
                newMark1 = 'No';
                break;
            default:
                newMark1 = null;
        }
        let newMark2;
        switch(values[1].NewMark) {
            case 1:
                newMark2 = 'Yes';
                break;
            case 0:
                newMark2 = 'No';
                break;
            default:
                newMark2 = null;
        }
        return {
            NewMark1: newMark1,
            Mark1Number: values[0].Number,
            Mark1Position: values[0].Position,
            NewMark2: newMark2,
            Mark2Number: values[1].Number,
            Mark2Position: values[1].Position
        }
    }
};

const spreadTags = (values) => {
    if (!values) {
        return {
            NewTag1: null,
            Tag1Number: null,
            Tag1Position: null,
            NewTag2: null,
            Tag2Number: null,
            Tag2Position: null
        }
    } else if(values.length === 1) {
        let newTag1;
        switch(values[0].NewTag) {
            case 1:
                newTag1 = 'Yes';
                break;
            case 0:
                newTag1 = 'No';
                break;
            default:
                newTag1 = null;
        }
        return {
            NewTag1: newTag1,
            Tag1Number: values[0].Number,
            Tag1Position: values[0].Position,
            NewTag2: null,
            Tag2Number: null,
            Tag2Position: null
        }
    } else {
        let newTag1;
        switch(values[0].NewTag) {
            case 1:
                newTag1 = 'Yes';
                break;
            case 0:
                newTag1 = 'No';
                break;
            default:
                newTag1 = null;
        }
        let newTag2;
        switch(values[1].NewTag) {
            case 1:
                newTag2 = 'Yes';
                break;
            case 0:
                newTag2 = 'No';
                break;
            default:
                newTag2 = null;
        }
        return {
            NewTag1: newTag1,
            Tag1Number: values[0].Number,
            Tag1Position: values[0].Position,
            NewTag2: newTag2,
            Tag2Number: values[1].Number,
            Tag2Position: values[1].Position
        }
    }
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