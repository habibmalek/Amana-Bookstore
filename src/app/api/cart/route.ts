/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { CartItemDB, CartDocument } from '@/app/types';

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

    const enrichedItems = items.map(item => {
      const book = books.find(b => b.id === item.bookId);
      return { ...item, book };
    });

    return NextResponse.json({ items: enrichedItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { cartId, bookId, quantity = 1 }: { cartId: string; bookId: string; quantity?: number } = await request.json();

    if (!cartId || !bookId) {
      return NextResponse.json({ error: 'cartId and bookId are required' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.collection('carts').findOneAndUpdate(
      { cartId },
      {
        $setOnInsert: {
          cartId,
          items: [],
          createdAt: new Date(),
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (!result?.value) {
      return NextResponse.json({ error: 'Failed to create or retrieve cart' }, { status: 500 });
    }

    const updatedItems: CartItemDB[] = Array.isArray(result.value.items) ? result.value.items : [];

    const existingIndex = updatedItems.findIndex(item => item.bookId === bookId);

    if (existingIndex >= 0) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems.push({ bookId, quantity });
    }

    await db.collection('carts').updateOne(
      { cartId },
      { $set: { items: updatedItems, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// PUT /api/cart - Update cart item
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    // In a real application, this would update an existing cart item
    return NextResponse.json({ 
      message: 'Cart item updated successfully',
      item: body 
    });
  } catch (err) {
    console.error('Error updating cart item:', err);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    // In a real application, this would remove an item from the user's cart
    return NextResponse.json({ 
      message: 'Item removed from cart successfully',
      itemId 
    });
  } catch (err) {
    console.error('Error removing cart item:', err);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}

// Future implementation notes:
// - Session management for user carts (using NextAuth.js or similar)
// - Database integration patterns (Prisma, Drizzle, or raw SQL)
// - Cart persistence strategies:
//   * Guest carts: Store in localStorage/cookies with optional merge on login
//   * User carts: Store in database with user ID association
//   * Hybrid approach: localStorage for guests, database for authenticated users
// - Security considerations:
//   * Validate user ownership of cart items
//   * Sanitize input data
//   * Rate limiting to prevent abuse
// - Performance optimizations:
//   * Cache frequently accessed cart data
//   * Batch operations for multiple item updates
//   * Implement optimistic updates on the frontend

// Example future database integration:
// import { db } from '@/lib/database';
// import { getServerSession } from 'next-auth';
// 
// export async function GET() {
//   const session = await getServerSession();
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }
//   
//   try {
//     const cartItems = await db.cartItem.findMany({
//       where: { userId: session.user.id },
//       include: { book: true }
//     });
//     
//     return NextResponse.json(cartItems);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to fetch cart items' },
//       { status: 500 }
//     );
//   }
// }