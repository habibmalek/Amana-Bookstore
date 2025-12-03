// scripts/test-connection.ts
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

async function testConnection() {
  console.log('🔗 Testing MongoDB connection...');
  console.log(`URI: ${MONGODB_URI?.substring(0, 40)}...`);
  console.log(`Database: ${MONGODB_DB}`);

  let client;
  try {
    // ⚠️ TEMPORARY: Bypass SSL validation (for testing only)
    client = new MongoClient(MONGODB_URI!, {
      tls: true,
      // ⛔ DO NOT USE IN PRODUCTION
      tlsAllowInvalidCertificates: true,
      tlsInsecure: true,
    });

    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    const db = client.db(MONGODB_DB);
    const collections = await db.listCollections().toArray();
    console.log(`📚 Existing collections: ${collections.map(c => c.name).join(', ') || 'None'}`);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  } finally {
    await client?.close();
    console.log('🔌 Connection closed');
  }
}

testConnection();