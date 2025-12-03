// src/app/api/reviews/[bookId]/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const { bookId } = params;
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