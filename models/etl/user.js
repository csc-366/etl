import {query, format} from "./db";

const ingestAffiliations = async (affiliations) => {
    const insertValues = affiliations.map(({affiliation, description}) => {
        return format('(?,?)', [affiliation, description]);
    }).join(',');
    query(`INSERT INTO Affiliation (Affiliation, Description) VALUES ${insertValues}`);
};

const ingestUsers = async (users) => {
    const insertValues = users.map(({username, passwordHash, passwordSalt, firstName, lastName, email, affiliation, role}) => {
        return format('(?,?,?,?,?,?,?,?)', [username, passwordHash, passwordSalt, firstName, lastName, email, affiliation, role])
    }).join(',');
    query(`INSERT INTO User (Username, PasswordHash, PasswordSalt, FirstName, LastName, Email, Affiliation, Role) VALUES ${insertValues}`);
};
