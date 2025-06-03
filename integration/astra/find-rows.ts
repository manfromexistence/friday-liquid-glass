import { connectToDatabase } from "./connect";
import { TableSchema, TablePrimaryKey } from "./create-table";

(async function () {
  const database = connectToDatabase();

  const table = database.table<TableSchema, TablePrimaryKey>("quickstartTable");

  // Find rows that match a filter
  console.log("\nFinding books with rating greater than 4.7...");

  const ratingCursor = table.find(
    { rating: { $gt: 4.7 } },
    {
      limit: 10,
      projection: { title: true, rating: true },
    }
  );

  for await (const row of ratingCursor) {
    console.log(`${row.title} is rated ${row.rating}`);
  }

  // Perform a vector search to find the closest match to a search string
  console.log("\nUsing vector search to find a single scary novel...");

  const singleVectorMatch = await table.findOne(
    {},
    {
      sort: { summary_genres_vector: "A scary novel" },
      projection: { title: true },
    },
  );

  console.log(`${singleVectorMatch?.title} is a scary novel`);

  // Combine a filter, vector search, and projection to find the 3 books with
  // more than 400 pages that are the closest matches to a search string
  console.log(
    "\nUsing filters and vector search to find 3 books with more than 400 pages that are set in the arctic, returning just the title and author...",
  );

  const vectorCursor = table.find(
    { number_of_pages: { $gt: 400 } },
    {
      sort: { summary_genres_vector: "A book set in the arctic" },
      limit: 3,
      projection: { title: true, author: true },
    },
  );

  for await (const row of vectorCursor) {
    console.log(row);
  }
})();