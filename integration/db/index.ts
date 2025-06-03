import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient("AstraCS:oDWFgawNwiZRyHFrQLNZbZEh:c3fd606598f9c773ba5aa853e90c53dda38e91aef72e236cb796c3d3ca65f9eb");
const database = client.db("https://e8fbcc91-ca2e-4c64-8fc0-d3a019005ff4-us-east-2.apps.astra.datastax.com");
const collection = database.collection("test");

// Define the type for the collection
interface User {
  name: string;
  age?: number;
  color?: number;
  food?: any;
}

// Get a collection
(async function () {
 const result = await collection.findOne({ name: "Sumon" });
  console.log(result);
})();

// import { DataAPIClient } from "@datastax/astra-db-ts";

// // Initialize the client
// const client = new DataAPIClient('AstraCS:oDWFgawNwiZRyHFrQLNZbZEh:c3fd606598f9c773ba5aa853e90c53dda38e91aef72e236cb796c3d3ca65f9eb');
// const db = client.db('https://e8fbcc91-ca2e-4c64-8fc0-d3a019005ff4-us-east-2.apps.astra.datastax.com');

// (async () => {
//   const colls = await db.listCollections();
//   console.log('Connected to AstraDB:', colls);
// })();

// import {
//   DataAPIClient,
//   CollectionInsertManyError,
// } from "@datastax/astra-db-ts";

// // Get an existing collection
// const client = new DataAPIClient(
//   "AstraCS:oDWFgawNwiZRyHFrQLNZbZEh:c3fd606598f9c773ba5aa853e90c53dda38e91aef72e236cb796c3d3ca65f9eb"
// );
// const database = client.db(
//   "https://e8fbcc91-ca2e-4c64-8fc0-d3a019005ff4-us-east-2.apps.astra.datastax.com"
// );
// const collection = database.collection("test");

// // Insert documents into the collection
// (async function () {
//   try {
//     const result = await collection.insertMany([
//       {
//         name: "Emon",
//         age: 22,
//         color: "white",
//         foods: ["carrots", "chocolate"],
//       },
//       {
//         name: "Sumon",
//         age: 19,
//         color: "white",
//         foods: ["carrots", "chocolate"],
//       },
//       {
//         name: "Shohan",
//         age: 18,
//         color: "white",
//         foods: ["carrots", "chocolate"],
//       },
//     ]);
//   } catch (error) {
//     if (error instanceof CollectionInsertManyError) {
//       console.log(error);
//     }
//   }
// })();
