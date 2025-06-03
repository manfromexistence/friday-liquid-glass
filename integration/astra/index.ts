import { DataAPIClient } from "@datastax/astra-db-ts";

// Initialize the client
const client = new DataAPIClient("AstraCS:sWfZysPpUntMmshIlFqkoJth:553abc229d84addaa8b042b4f6ca653003b3ac94c1db31af21e1054eb9eee873");
const db = client.db("https://343d000d-f560-48cd-ad81-3e6197ab4a41-us-east-2.apps.astra.datastax.com");

(async () => {
  const colls = await db.listCollections();
  console.log("Connected to AstraDB:", colls);
})();