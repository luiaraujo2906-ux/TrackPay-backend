import { db } from "./database";

async function testDatabase() {
  try {
    const [result] = await db.query("SELECT 1");

    console.log("Database connected:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await db.end();
  }
}

testDatabase();
