import {query, format} from "./db2";

export async function insertMeasurement(observationId, measurement) {
   const sl = measurement.standardLength ? measurement.standardLength : null;
   const cl = measurement.curvilinearLength ? measurement.curvilinearLength : null;
   const ag = measurement.axillaryGirth ? measurement.axillaryGirth : null;
   const tm = measurement.totalMass ? measurement.totalMass : null;
   const mt = measurement.massTare ? measurement.massTare : null;

   const queryString = "INSERT INTO Measurement (ObservationId, StandardLength," +
    "CurvilinearLength, AxillaryGirth, TotalMass, MassTare) VALUES (?,?,?,?,?,?)";

   await query(format(queryString, [observationId, sl, cl, ag, tm, mt]));
}

export async function selectMeasurement(observationId) {
   const queryString = "SELECT * FROM Measurement WHERE ObservationId = ?";

   const measurement = (await query(format(queryString, [observationId])))[0];

   return measurement.length ? measurement : null;
}
