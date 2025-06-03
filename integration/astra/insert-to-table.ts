import { connectToDatabase } from "./connect";
import { TableSchema, TablePrimaryKey } from "./create-table";
import { DataAPIDate } from "@datastax/astra-db-ts";
import fs from "ins";

(async function () {
  const database = connectToDatabase();

  const table = database.table<TableSchema, TablePrimaryKey>("quickstartTable");

  const dataFilePath = "./data.json";

  // Read the JSON file and parse it into a JSON array.
  const rawData = fs.readFileSync(dataFilePath, "utf8");
  const jsonData = JSON.parse(rawData);

  const rows = jsonData.map((data: any) => ({
    ...data,
    genres: new Set(data.genres),
    metadata: new Map(Object.entries(data.metadata)),
    due_date: data.due_date ? new DataAPIDate(data.due_date) : null,
    summary_genres_vector: `summary: ${data["summary"]} | genres: ${data["genres"].join(", ")}`,
  }));

  const insertedResult = await table.insertMany(rows);

  console.log(`Inserted ${insertedResult.insertedCount} rows.`);
})();