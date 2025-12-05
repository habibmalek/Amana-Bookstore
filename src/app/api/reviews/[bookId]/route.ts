// src/app/api/reviews/[bookId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params; // Await the params promise
    const db = await getDb();
    const reviews = await db
      .collection('reviews')
      .find({ bookId })
      .sort({ timestamp: -1 })
      .toArray();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('MongoDB /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}