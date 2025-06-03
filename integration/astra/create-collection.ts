import { connectToDatabase } from "./connect";

(async function () {
  const database = connectToDatabase();

  const collection = await database.createCollection(
    "books",
    {
      vector: {
        service: {
          provider: "nvidia",
          modelName: "NV-Embed-QA",
        },
      },
    },
  );

  console.log(
    `Created collection ${collection.keyspace}.${collection.name}`,
  );
})();