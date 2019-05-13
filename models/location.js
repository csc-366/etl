import {format, query} from "./db";

export const ingestRookeries = async (rookeries) => {
    const insertValues = rookeries.map(({rookery, rookeryName}) => {
        return format('(?,?)', [rookeryu, rookeryName]);
    }).join(',');
    query(`INSERT INTO Rookery (Rookery, RookeryName) VALUES ${insertValues}`);
};

export const ingestNationalLocations = async (nationalLocations) => {
    const insertValues = nationalLocations.map(({nationalLocation, location, nationalLocationName}) => {
        return format('(?,?,?)', [nationalLocation, location, nationalLocationName]);
    }).join(',');
    query(`INSERT INTO NationalLocation (NationalLocation, Location, NationalLocationName) VALUES ${insertValues}`)
};

export const ingestLocation = async (locations) => {
    const insertValues = locations.map(({beach, beachName, rookery}) => {
        return format('(?,?,?)', [beach, beachName, rookery]);
    }).join(',');
    query(`INSERT INTO Location (Beach, BeachName, Rookery) VALUES ${insertValues}`);
};
