import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

async function testConnection() {
  console.log('🔗 Testing MongoDB connection...');
  console.log(`URI: ${MONGODB_URI?.substring(0, 40)}...`);
  console.log(`Database: ${MONGODB_DB}`);

  let client: MongoClient;

  try {
    client = await MongoClient.connect(MONGODB_URI!);
    console.log('✅ Successfully connected to MongoDB Atlas!');

    const db = client.db(MONGODB_DB);
    
    // Test basic operations
    const collections = await db.listCollections().toArray();
    console.log(`📚 Existing collections: ${collections.map(c => c.name).join(', ') || 'None'}`);

    // Test write operation
    const testCollection = db.collection('connection_test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date() 
    });
    console.log('✅ Write test successful');

    // Clean up
    await testCollection.deleteMany({ test: true });
    console.log('✅ Cleanup successful');

  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  } finally {
    if (client!) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

testConnection();