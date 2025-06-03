import { DataAPIClient, Db } from "@datastax/astra-db-ts";
import type { VectorizeDoc } from "@datastax/astra-db-ts";


export function connectToDatabase(): Db {
  // const endpoint = "https://86aa9693-ff4b-42d1-8a3d-a3e6d65b7d80-us-east-2.apps.astra.datastax.com";
  // const token = "AstraCS:wgxhHEEYccerYdqKsaTyQKox:4d0ac01c55062c11fc1e9478acedc77c525c0b278ebbd7220e1d873abd913119";
  const endpoint =
    "https://343d000d-f560-48cd-ad81-3e6197ab4a41-us-east-2.apps.astra.datastax.com";
  const token =
    "AstraCS:JIpuQqwxaOIykFxvgNDCeyEw:41a0c97038b9eec7f313e17145ae48b64646425031c32d9c42e84e0cb50a7ed5";

  if (!token || !endpoint) {
    throw new Error(
      "Environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined."
    );
  }

  // Create an instance of the `DataAPIClient` class with your token.
  const client = new DataAPIClient(token);

  // Get the database specified by your endpoint.
  const database = client.db(endpoint);

  console.log(`Connected to database ${database.id}`);

  return database;
}

// You can define interfaces that describe the shape of your data.
// The VectorizeDoc interface adds a $vectorize key.
export interface Book extends VectorizeDoc {
  title: string;
  author: string;
  numberOfPages: number;
  rating: number;
  publicationYear: number;
  summary: string;
  genres: string[];
  metadata: {
    ISBN: string;
    language: string;
    edition: string;
  };
  isCheckedOut: boolean;
  borrower: string | null;
  dueDate: string | null;
}
