// src/app/api/books/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    const db = await getDb();

    if (bookId) {
      const book = await db.collection('books').findOne({ id: bookId });
      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }
      return NextResponse.json({ book });
    }

    const books = await db.collection('books').find({}).toArray();
    return NextResponse.json({ books });
  } catch (error) {
    console.error('MongoDB /api/books error:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}