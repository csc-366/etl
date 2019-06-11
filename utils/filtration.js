import { format } from '../models/db2';

const observationFilterJoins = {
   observer: " JOIN Observer on Observer.Email = O.Observer",
};

const observationFilterConditions = {
   location: " Location = ?",
   startDate: " Date >= ?",
   endDate: " Date <= ?",
   ageClass: " AgeClass = ?",
   observer: " Observer = ?",
};

const pendingFilterConditions = {
   location: " Location = ?",
   fieldLeaders: " FieldLeaders LIKE ?",
   startDate: " Date >= ?",
   endDate: " Date <= ?",
   sex: " Sex = ?",
   ageClass: " Age = ?",
   pupCount: " PupCount = ?",
   lowerMoltLimit: " MoltPercentage >= ?",
   upperMoltLimit: " MoltPercentage <= ?",
};

export function appendQueryJoins(queryString, filters) {

   for (let prop in filters) {
      if (filters.hasOwnProperty(prop)) {
         if (filters[prop] && observationFilterJoins[prop]) {
            queryString += observationFilterJoins[prop];
         }
      }
   }

   return format(queryString);
}

export function appendQueryConditions(type, queryString, filters) {
   let filterValues = [];

   if (filters.fieldLeaders) {
      filters.fieldLeaders = "%" + filters.fieldLeaders + "%";
   }

   queryString += " WHERE";

   switch (type) {
      case "pending":
         for (let prop in filters) {
            if (filters.hasOwnProperty(prop)) {
               if (filters[prop] && pendingFilterConditions[prop]) {
                  queryString += pendingFilterConditions[prop];
                  queryString += " AND";
                  filterValues.push(filters[prop]);
               }
            }
         }
         break;
      case "observations":
         for (let prop in filters) {
            if (filters.hasOwnProperty(prop)) {
               if (filters[prop] && observationFilterConditions[prop]) {
                  queryString += observationFilterConditions[prop];
                  queryString += " AND";
                  filterValues.push(filters[prop]);
               }
            }
         }
      break;
   }
   queryString = queryString.substring(0, queryString.lastIndexOf(" "));
   return format(queryString + " LIMIT 50", filterValues);
}
