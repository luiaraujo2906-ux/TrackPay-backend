import mysql from "mysql2/promise";
import "dotenv/config";

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const db = mysql.createPool({
  host: getRequiredEnv("MYSQL_HOST"),
  port: Number(getRequiredEnv("MYSQL_PORT")),
  user: getRequiredEnv("MYSQL_USER"),
  password: getRequiredEnv("MYSQL_PASSWORD"),
  database: getRequiredEnv("MYSQL_DATABASE"),
});
