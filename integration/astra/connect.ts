import { DataAPIClient, Db } from "@datastax/astra-db-ts";

/**
 * Connects to a DataStax Astra database.
 * This function retrieves the database endpoint and application token from the
 * environment variables `API_ENDPOINT` and `APPLICATION_TOKEN`.
 *
 * @returns An instance of the connected database.
 * @throws Will throw an error if the environment variables
 * `API_ENDPOINT` or `APPLICATION_TOKEN` are not defined.
 */
export function connectToDatabase(): Db {
  const endpoint =
    "https://343d000d-f560-48cd-ad81-3e6197ab4a41-us-east-2.apps.astra.datastax.com";
  const token =
    "AstraCS:JIpuQqwxaOIykFxvgNDCeyEw:41a0c97038b9eec7f313e17145ae48b64646425031c32d9c42e84e0cb50a7ed5";

  if (!token || !endpoint) {
    throw new Error(
      "Environment variables API_ENDPOINT and APPLICATION_TOKEN must be defined."
    );
  }

  // Create an instance of the `DataAPIClient` class
  const client = new DataAPIClient();

  // Get the database specified by your endpoint and provide the token
  const database = client.db(endpoint, { token });

  console.log(`Connected to database ${database.id}`);

  return database;
}
