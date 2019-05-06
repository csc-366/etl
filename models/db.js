import mysql from 'mysql';

let pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

export const query = pool.query;

export async function insert(data) {
    insertObserver(data);
    insertObservation(data);
}