// /lib/mongodb.ts
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

// Declare cached connection types
interface MongoConnection {
  client: MongoClient;
  db: ReturnType<MongoClient['db']>;
}

// Use a global variable to cache the connection in development
// This prevents creating new connections on every API request
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In production, create a new MongoClient instance
if (process.env.NODE_ENV === 'production') {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
} else {
  // In development, use a global variable to preserve connection across module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

// The main function to get the database - THIS IS WHAT YOUR API ROUTE CALLS
export async function getDb() {
  try {
    // ⚠️ The connection ONLY happens here, when the function is called at runtime.
    await clientPromise;
    const db = client.db(MONGODB_DB);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed');
  }
}

// Optional: Export the client promise for direct use elsewhere if needed
export { clientPromise };