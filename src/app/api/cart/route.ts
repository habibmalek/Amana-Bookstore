import { CartDocument, CartItemDB } from "@/app/types";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

// src/app/api/cart/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
    }

    const db = await getDb();
    const cart = await db.collection<CartDocument>('carts').findOne({ cartId });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    const items: CartItemDB[] = Array.isArray(cart.items) ? cart.items : [];

    if (items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch book details
    const bookIds = items.map(item => item.bookId);
    const books = await db
      .collection('books')
      .find({ id: { $in: bookIds } })
      .toArray();

    // Map books to items
    const enrichedItems = items.map(item => {
      const book = books.find(b => b.id === item.bookId);
      return book ? { ...item, book } : null;
    }).filter(item => item !== null); // Remove null items

    return NextResponse.json({ items: enrichedItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('carts').deleteOne({ cartId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}