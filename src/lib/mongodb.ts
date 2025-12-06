// /lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

// Define types for our cached connection
interface MongoCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
  db: Db | null;
}

// Use a global variable in development to persist the connection
// This prevents multiple connections during hot-reload
declare global {
  // eslint-disable-next-line no-var
  var _mongoCache: MongoCache | undefined;
}

// Initialize cache
const mongoCache: MongoCache = global._mongoCache || {
  client: null,
  promise: null,
  db: null,
};

// In development, assign to global variable
if (process.env.NODE_ENV !== 'production') {
  global._mongoCache = mongoCache;
}

/**
 * Get a connection to the MongoDB database
 * Only connects when first called, then caches the connection
 */
export async function getDb(): Promise<Db> {
  // Validate environment variables HERE, at runtime (not at module load)
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB;

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined at runtime.');
    throw new Error('MONGODB_URI environment variable is not configured.');
  }

  if (!MONGODB_DB) {
    console.error('❌ MONGODB_DB is undefined at runtime.');
    throw new Error('MONGODB_DB environment variable is not configured.');
  }

  // Validate URI format at runtime
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    console.error('❌ Invalid MONGODB_URI format at runtime.');
    throw new Error('Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://');
  }

  // If we already have a connected database instance, return it
  if (mongoCache.db) {
    return mongoCache.db;
  }

  // If we're already connecting, wait for that connection
  if (mongoCache.promise) {
    await mongoCache.promise;
    return mongoCache.db!;
  }

  try {
    console.log('🔗 Establishing MongoDB connection...');
    
    // Create new MongoClient with connection options
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    // Store the promise (not the result) to prevent multiple connections
    mongoCache.promise = client.connect();

    // Wait for connection
    mongoCache.client = await mongoCache.promise;
    mongoCache.db = mongoCache.client.db(MONGODB_DB);

    console.log('✅ MongoDB connected successfully');
    return mongoCache.db;
  } catch (error) {
    // Clear cache on connection failure
    mongoCache.client = null;
    mongoCache.promise = null;
    mongoCache.db = null;

    console.error('❌ MongoDB connection failed:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Close the MongoDB connection (useful for testing or cleanup)
 */
export async function closeConnection(): Promise<void> {
  if (mongoCache.client) {
    await mongoCache.client.close();
    mongoCache.client = null;
    mongoCache.promise = null;
    mongoCache.db = null;
    console.log('🔌 MongoDB connection closed');
  }
}

/**
 * Check if database is connected (health check)
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}