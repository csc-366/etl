import { query, checkQuery, format } from "./db2";
import {
  spreadMarks,
  spreadTags,
  completeQueryString,
  completeTagsString,
  completeMarksString
} from "../models/export";

export async function addNewSeal(observationId, observation) {
  const sex = sex === "M" || sex === "F" ? observation.sex : null;
  const procedure = observation.procedure ? observation.procedure : null;

  const queryString =
    "INSERT INTO Seal (FirstObservation, Sex, `Procedure`)" + " VALUES (?,?,?)";

  await query(format(queryString, [observationId, sex, procedure]));
}

export async function retrieveSeals(count = -1, page = -1) {
  let sealList = await query(
    format("SELECT * FROM Seal" + " LIMIT ?,?", [
      parseInt(page),
      parseInt(count)
    ])
  );

  return sealList[0];
}

export async function getSealBySealId(sealId) {
  const queryString = "SELECT * FROM Seal WHERE FirstObservation = ?";

  let seal = (await query(format(queryString, [sealId])))[0];

  if (seal.length) {
    return seal[0];
  }
  return null;
}

export async function getSealByObservationId(observationId) {
  const queryString =
    "SELECT S.* FROM Seal S " +
    "JOIN SealObservation SO on SO.SealId = S.FirstObservation " +
    "WHERE SO.ObservationId = ?";

  let seal = (await query(format(queryString, [observationId])))[0];

  if (seal.length) {
    return seal[0];
  }
  return null;
}

export async function getSealFromTag(tagNumber) {
  const queryString =
    "SELECT * FROM Seal S " +
    "JOIN TagDeployment TD on TD.SealId = S.FirstObservation " +
    "WHERE TD.TagNumber = ?";

  let seal = (await query(format(queryString, [tagNumber])))[0];

  if (seal.length) {
    return seal[0];
  }
  return null;
}

// TODO: This function only returns the first seal from the query. There
//  have been cases where multiple seals are retrieved, which should not be
//  the case for any given mark number and season pair.
export async function getSealFromMark(markNumber, season) {
  const queryString =
    "SELECT * FROM Seal S " +
    "JOIN MarkDeployment MD on MD.SealId = S.FirstObservation " +
    "JOIN Mark M on M.ID = MD.MarkId " +
    "WHERE (M.Number, Season) = (?,?)";

  let seal = (await query(format(queryString, [markNumber, season])))[0];

  if (seal.length) {
    return seal[0];
  }
  return null;
}

export async function getSealsFromPartialTag(tagNumber) {
  const queryString =
    "SELECT FirstObservation as SealId, Sex, `Procedure` FROM Seal S " +
    "JOIN TagDeployment TD on TD.SealId = S.FirstObservation " +
    "WHERE TD.TagNumber LIKE ? " +
    "GROUP BY SealId";

  return (await query(format(queryString, [tagNumber])))[0];
}

export async function getSealsFromPartialMark(markNumber, season) {
  const queryString =
    "SELECT FirstObservation as SealId, Sex, `Procedure` FROM Seal S " +
    "JOIN MarkDeployment MD on MD.SealId = S.FirstObservation " +
    "JOIN Mark M on M.ID = MD.MarkId " +
    "WHERE M.Number LIKE ? AND Season = ? " +
    "GROUP BY SealId";

  return (await query(format(queryString, [markNumber, season])))[0];
}
