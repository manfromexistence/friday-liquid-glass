import { connectToDatabase } from "./connect";

(async function () {
  const database = connectToDatabase();

  const collection = database.collection("quickstart_collection");

  // Find documents that match a filter
  console.log("\nFinding books with rating greater than 4.7...");

  const ratingCursor = collection.find(
    { rating: { $gt: 4.7 } },
    { limit: 10 },
  );

  for await (const document of ratingCursor) {
    console.log(`${document.title} is rated ${document.rating}`);
  }

  // Perform a vector search to find the closest match to a search string
  console.log("\nUsing vector search to find a single scary novel...");

  const singleVectorMatch = await collection.findOne(
    {},
    { sort: { $vectorize: "A scary novel" } },
  );

  console.log(`${singleVectorMatch?.title} is a scary novel`);

  // Combine a filter, vector search, and projection to find the 3 books with
  // more than 400 pages that are the closest matches to a search string,
  // and just return the title and author
  console.log("\nUsing filters and vector search to find 3 books with more than 400 pages that are set in the arctic, returning just the title and author...");

  const vectorCursor = collection.find(
    { number_of_pages: { $gt: 400 } },
    {
      sort: { $vectorize: "A book set in the arctic" },
      limit: 3,
      projection: { title: true, author: true },
    },
  );

  for await (const document of vectorCursor) {
    console.log(document);
  }
})();