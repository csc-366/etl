import mysql from "mysql2/promise";
import 'dotenv/config';

const poolSize = 10;
const {DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE} = process.env;

export const pool = mysql.createPool({
   connectionLimit: poolSize,
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE
});

export const format = mysql.format;

export const startTransaction = async () => {
   const connection = await pool.getConnection();
   try {
      await connection.query("START TRANSACTION");
      return connection;
   }
   catch (e) {
      throw e;
   }
};

export const rollback = async (connection) => {
   await connection.query("ROLLBACK");
}

export const query = async (q) => {
   console.log(q);
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

export const checkQuery = async (q) => {
   let result;
   let err = 0;
   const connection = await pool.getConnection();
   try {
      await connection.query("START TRANSACTION");
      result = await connection.query(q);
      return {err, result}
   }
   catch (e) {
      err = 1;
      result = e;
      return {err, result}
   }
   finally {
      await connection.query('ROLLBACK');
      connection.release();
   }
};

