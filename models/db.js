import mysql from "mysql2/promise";
import 'dotenv/config';

const poolSize = 10;
const {DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE} = process.env;

const pool = mysql.createPool({
   connectionLimit: poolSize,
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE
});

export const format = mysql.format;

export const query = async (q) => {
   const connection = await pool.getConnection();
   try {
      return (await connection.query(q));
   } catch (e) {
      throw e;
   }
   finally {
      connection.release();
   }
};
