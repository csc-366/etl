import * as mysql from "mysql";

const {DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE} = process.env;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
});

export const credentialsAreValid = async (username) => {
    const connection = await pool.getConnection()
    const response = await connection.query(`SELECT * FROM User WHERE Username='${username}'`);

    const user = response.rows[0];
    console.log(user);

};

