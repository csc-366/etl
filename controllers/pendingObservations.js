import {validationResult} from "express-validator/check";
import {sendData, sendError} from "../utils/responseHelper";
import {
   getPendingWithFilters,
   getSinglePending,
   insertPending, removePending
} from "../models/pendingObservations";
import {
   getPendingObservation,
   getPendingObservations,
   getPendingObservationsCount
} from "../models/observations";

export async function all(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const pendingList = await getPendingObservations();
   const formattedPendingList = pendingList.map(observation => mapObservation(observation));

   sendData(res, formattedPendingList)
}

export async function pending(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const pendingList = await getPendingObservations(req.query.count, req.query.page);

   sendData(res, pendingList);
}

export async function singlePending(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const {id} = req.params;
   const observation = await getPendingObservation(id);
   const formattedObservation = mapObservation(observation);
   sendData(res, formattedObservation)
}


export async function count(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   const pendingCount = await getPendingObservationsCount();

   sendData(res, pendingCount);
}

export async function getFilteredPending(req, res) {
   const location = req.query.location;
   const startDate = req.query.startDate;
   const endDate = req.query.endDate;
   const fieldLeaders = req.query.fieldLeaders;
   const sex = req.query.sex;
   const pupCount = req.query.pupCount;
   const lowerMoltLimit = req.query.lowerMoltLimit;
   const upperMoltLimit = req.query.upperMoltLimit;

   let ageClass = req.query.ageClass;
   if (req.query.hasOwnProperty('pupAge')) {
      ageClass = req.query.pupAge;
   }

   const pending = await getPendingWithFilters({
      location,
      startDate, endDate, fieldLeaders, ageClass, sex, pupCount,
      lowerMoltLimit, upperMoltLimit
   });

   sendData(res, pending)
}

export async function submitPending(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }
   if (req.body.hasOwnProperty("ageClass") || req.body.hasOwnProperty("pupAge")) {
      req.body.age = req.body.pupAge ? req.body.pupAge : req.body.ageClass;
      delete req.body.ageClass;
      delete req.body.pupAge;
   }

   if (req.body.hasOwnProperty("observer")) {
      delete req.body.observer
   }

   let upperCaseBody = capitalizeFirst(req.body);
   upperCaseBody = parseMarks(upperCaseBody);
   upperCaseBody = parseTags(upperCaseBody);
   upperCaseBody = parseMeasurements(upperCaseBody);

   const observationId = await insertPending(upperCaseBody);

   if (!observationId) {
      sendError(res, 500, ["Could not insert pending Observation"])
      return;
   }

   const pendingObservation = await getSinglePending(observationId);
   sendData(res, pendingObservation);
}

export async function deletePending(req, res) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      sendError(res, 400, errors.array());
      return;
   }

   await removePending(req.params.observationId);
   sendData(res, [])
}

export async function convertPending(req, res) {


   await removePending(req.params.observationId);
   sendData(res, [])
}

function capitalizeFirst(obj) {
   let newO, origKey, newKey, value;
   if (obj instanceof Array) {
      return obj.map(function (value) {
         if (typeof value === "object") {
            value = capitalizeFirst(value)
         }
         return value
      })
   } else {
      newO = {}
      for (origKey in obj) {
         if (obj.hasOwnProperty(origKey)) {
            newKey = (origKey.charAt(0).toUpperCase() + origKey.slice(1) || origKey).toString()
            value = obj[origKey]
            if (value instanceof Array || (value !== null && value.constructor === Object)) {
               value = capitalizeFirst(value)
            }
            newO[newKey] = value
         }
      }
   }
   return newO
}

function parseMarks(upperCaseBody) {
   if (!upperCaseBody.hasOwnProperty("Marks")) {
      return upperCaseBody;
   } else if (upperCaseBody.Marks.length === 1) {
      let Mark1 = {};
      Mark1.NewMark1 = upperCaseBody.Marks[0].IsNew;
      Mark1.Mark1 = upperCaseBody.Marks[0].Number;
      Mark1.Mark1Position = upperCaseBody.Marks[0].Position;
      upperCaseBody = {...upperCaseBody, ...Mark1};
   } else if (upperCaseBody.Marks.length >= 2) {
      let Mark1 = {}, Mark2 = {};
      Mark1.NewMark1 = upperCaseBody.Marks[0].IsNew;
      Mark1.Mark1 = upperCaseBody.Marks[0].Number;
      Mark1.Mark1Position = upperCaseBody.Marks[0].Position;
      Mark2.NewMark2 = upperCaseBody.Marks[1].IsNew;
      Mark2.Mark2 = upperCaseBody.Marks[1].Number;
      Mark2.Mark2Position = upperCaseBody.Marks[1].Position;
      upperCaseBody = {...upperCaseBody, ...Mark1, ...Mark2};
   }
   delete upperCaseBody.Marks;
   return upperCaseBody;
}

function parseTags(upperCaseBody) {
   if (!upperCaseBody.hasOwnProperty("Tags")) {
      return upperCaseBody;
   } else if (upperCaseBody.Tags.length === 1) {
      let Tag1 = {};
      Tag1.NewTag1 = upperCaseBody.Tags[0].IsNew;
      Tag1.Tag1Number = upperCaseBody.Tags[0].Color + upperCaseBody.Tags[0].Number;
      Tag1.Tag1Position = upperCaseBody.Tags[0].Position;
      upperCaseBody = {...upperCaseBody, ...Tag1};
   } else if (upperCaseBody.Tags.length >= 2) {
      let Tag1 = {}, Tag2 = {};
      Tag1.NewTag1 = upperCaseBody.Tags[0].IsNew;
      Tag1.Tag1Number = upperCaseBody.Tags[0].Color + upperCaseBody.Tags[0].Number;
      Tag1.Tag1Position = upperCaseBody.Tags[0].Position;
      Tag2.NewTag2 = upperCaseBody.Tags[1].IsNew;
      Tag1.Tag1Number = upperCaseBody.Tags[1].Color + upperCaseBody.Tags[1].Number;
      Tag2.Tag2Position = upperCaseBody.Tags[1].Position;
      upperCaseBody = {...upperCaseBody, ...Tag1, ...Tag2};
   }
   delete upperCaseBody.Tags;
   return upperCaseBody;
}

function parseMeasurements(upperCaseBody) {
   let Measurement = {};

   if (!upperCaseBody.hasOwnProperty("Measurement")) {
      return;
   }

   Measurement.StandardLength = upperCaseBody.Measurement.StandardLength;
   Measurement.CurvilinearLength = upperCaseBody.Measurement.CurvilinearLength;
   Measurement.AxillaryGirth = upperCaseBody.Measurement.AxillaryGirth;
   Measurement.Mass = upperCaseBody.Measurement.Mass;
   Measurement.Tare = upperCaseBody.Measurement.Tare;

   if (upperCaseBody.AnimalMass) {
      Measurement.AnimalMass = upperCaseBody.Measurement.AnimalMass;
   }
   delete upperCaseBody.Measurement;
   upperCaseBody = {...upperCaseBody, ...Measurement};
   console.log(upperCaseBody)
   return upperCaseBody;
}


const mapObservation = (observation) => {
   const formattedObservation = Object.entries(observation).reduce((agg, [key, value]) => {
      switch (key) {
         case 'Age':
         case 'Comments':
         case 'EnteredInAno':
         case 'FirstSeenAsWeanling':
         case 'Location':
         case 'LastSeenAsPup':
         case 'MoltPercentage':
         case 'ObservationId':
         case 'PupCount':
         case 'Range':
         case 'Season':
         case 'Sex':
         case 'Year':
         case 'Date':
            return {
               ...agg,
               [key]: value
            };
         case 'AnimalMass':
         case 'AxillaryGirth':
         case 'Mass':
         case 'StandardLength':
         case 'Tare':
         case 'CurvilinearLength': {
            const measurement = agg.measurement ? {
               ...agg.measurement,
               [key]: value
            } : {[key]: value};
            return {
               ...agg,
               measurement
            }
         }
         case 'FieldLeaders':
            return {
               ...agg,
               [key]: value ? value.split(',') : []
            };
         case 'Mark1': {
            const marks = [{...agg.marks[0], number: value}, agg.marks[1]];
            return {...agg, marks};
         }
         case 'NewMark1': {
            const marks = [{...agg.marks[0], isNew: value}, agg.marks[1]];
            return {...agg, marks};
         }
         case 'Mark1Position': {
            const marks = [{...agg.marks[0], position: value}, agg.marks[1]];
            return {...agg, marks};
         }
         case 'Mark2': {
            const marks = [agg.marks[0], {...agg.marks[1], number: value}];
            return {...agg, marks};
         }
         case 'NewMark2': {
            const marks = [agg.marks[0], {...agg.marks[1], isNew: value}];
            return {...agg, marks};
         }
         case 'Mark2Position': {
            const marks = [agg.marks[0], {...agg.marks[1], position: value}];
            return {...agg, marks};
         }
         case 'Tag1Number': {
            const tags = [{...agg.tags[0], number: value}, agg.tags[1]];
            return {...agg, tags};
         }
         case 'NewTag1': {
            const tags = [{...agg.tags[0], isNew: value}, agg.tags[1]];
            return {...agg, tags};
         }
         case 'Tag1Position': {
            const tags = [{...agg.tags[0], position: value}, agg.tags[1]];
            return {...agg, tags};
         }
         case 'NewTag2': {
            const tags = [agg.tags[0], {...agg.tags[1], isNew: value}];
            return {...agg, tags};
         }
         case 'Tag2Number': {
            const tags = [agg.tags[0], {...agg.tags[1], number: value}];
            return {...agg, tags};
         }
         case 'Tag2Position': {
            const tags = [agg.tags[0], {...agg.tags[1], position: value}];
            return {...agg, tags};
         }
         default:
            return agg
      }
   }, {marks: [{}, {}], tags: [{}, {}]});
   return formattedObservation;
};

