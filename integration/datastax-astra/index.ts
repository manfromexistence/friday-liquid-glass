import { DataAPIClient } from "@datastax/astra-db-ts";

// Initialize the client
const client = new DataAPIClient('AstraCS:ZJMLnITHHyxWFiUZZWPdEcOp:c12b158ab02f7990e43c6868cbf5a94c7aabafa235df04d47592a85e84966386');
const db = client.db('https://343d000d-f560-48cd-ad81-3e6197ab4a41-us-east-2.apps.astra.datastax.com');

(async () => {
  const colls = await db.listCollections();
  console.log('Connected to AstraDB:', colls);
})();