/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// Quick test data - just 3 books for testing
const testBooks = [
  {
    id: '1',
    title: 'Fundamentals of Classical Mechanics',
    author: 'Dr. Ahmad Al-Kindi',
    description: 'A comprehensive introduction to classical mechanics.',
    price: 89.99,
    image: '/images/book1.jpg',
    isbn: '978-0123456789',
    genre: ['Physics', 'Textbook'],
    tags: ['Mechanics', 'Physics'],
    datePublished: '2022-01-15',
    pages: 654,
    language: 'English',
    publisher: 'Al-Biruni Academic Press',
    rating: 4.8,
    reviewCount: 23,
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    title: 'Quantum Physics: Principles and Applications', 
    author: 'Prof. Fatima Al-Haytham',
    description: 'Advanced textbook exploring quantum mechanics.',
    price: 125.50,
    image: '/images/book2.jpg',
    isbn: '978-0234567890',
    genre: ['Physics', 'Quantum Mechanics'],
    tags: ['Quantum', 'Advanced Physics'],
    datePublished: '2023-03-10',
    pages: 782,
    language: 'English',
    publisher: 'Ibn Sina Publications',
    rating: 4.9,
    reviewCount: 18,
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    title: 'Stellar Astrophysics and Galactic Structure',
    author: 'Dr. Omar Al-Battani',
    description: 'Explores stellar evolution and galactic dynamics.',
    price: 98.75,
    image: '/images/book3.jpg',
    isbn: '978-0345678901',
    genre: ['Astronomy', 'Astrophysics'],
    tags: ['Stars', 'Galaxies'],
    datePublished: '2022-09-20',
    pages: 567,
    language: 'English',
    publisher: 'Al-Sufi Astronomical Society',
    rating: 4.7,
    reviewCount: 12,
    inStock: false,
    featured: false,
  }
];

const testReviews = [
  {
    id: 'review-1',
    bookId: '1',
    author: 'Dr. Yasmin Al-Baghdadi',
    rating: 5,
    title: 'Excellent foundation',
    comment: 'Comprehensive introduction with clear mathematical derivations.',
    timestamp: '2024-01-15T10:30:00Z',
    verified: true
  },
  {
    id: 'review-2', 
    bookId: '2',
    author: 'Ahmad Khalil',
    rating: 4,
    title: 'Clear explanations',
    comment: 'Challenging material made accessible through excellent explanations.',
    timestamp: '2024-02-03T14:22:00Z',
    verified: true
  }
];

async function quickMigrate() {
  let client;

  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    console.log('✅ Connected to MongoDB');

    // Clear existing test data (optional)
    try {
      await db.collection('books').deleteMany({ id: { $in: ['1', '2', '3'] } });
      await db.collection('reviews').deleteMany({ id: { $in: ['review-1', 'review-2'] } });
      console.log('🗑️  Cleared existing test data');
    } catch (error) {
      console.log('📝 No existing test data to clear');
    }

    // Insert test data
    console.log('📚 Inserting books...');
    const booksResult = await db.collection('books').insertMany(testBooks);
    console.log(`✅ Inserted ${booksResult.insertedCount} books`);

    console.log('⭐ Inserting reviews...');
    const reviewsResult = await db.collection('reviews').insertMany(testReviews);
    console.log(`✅ Inserted ${reviewsResult.insertedCount} reviews`);

    // Create indexes if they don't exist
    console.log('📊 Creating indexes...');
    await db.collection('books').createIndex({ id: 1 }, { unique: true });
    
    // Verify the data
    const booksCount = await db.collection('books').countDocuments();
    const reviewsCount = await db.collection('reviews').countDocuments();

    console.log('\n🎉 Quick migration completed!');
    console.log(`📚 Total books in database: ${booksCount}`);
    console.log(`⭐ Total reviews in database: ${reviewsCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

// Run the migration
quickMigrate();