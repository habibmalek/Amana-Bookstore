// src/lib/mongodb.ts
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is missing in environment variables');
}
if (!process.env.MONGODB_DB) {
  throw new Error('MONGODB_DB is missing in environment variables');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

const clientOptions = {
  serverSelectionTimeoutMS: 10000,
  tls: true,
  // Production-safe configuration
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, clientOptions);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, clientOptions);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export { clientPromise };