import { connectToDatabase } from "./connect";
import fs from "fs";

(async function () {
  const database = connectToDatabase();

  const collection = database.collection("books");

  const dataFilePath = "./data.json";

  // Read the JSON file and parse it into a JSON array
  const rawData = fs.readFileSync(dataFilePath, "utf8");
  const jsonData = JSON.parse(rawData);

  // Assemble the documents to insert:
  // - Convert the date string into a Date
  // - Add a $vectorize field
  const documents = jsonData.map((data: any) => ({
    ...data,
    due_date: data.due_date ? new Date(data.due_date) : null,
    $vectorize: `summary: ${data["summary"]} | genres: ${data["genres"].join(", ")}`,
  }));

  // Insert the data
  const inserted = await collection.insertMany(documents);

  console.log(`Inserted ${inserted.insertedCount} documents.`);
})();