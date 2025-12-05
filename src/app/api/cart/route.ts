import { CartDocument, CartItemDB } from "@/app/types";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from 'mongodb';

// ✅ ADD THIS POST METHOD
export async function POST(request: Request) {
  try {
    const { cartId, bookId, quantity } = await request.json();
    
    if (!cartId || !bookId) {
      return NextResponse.json({ error: 'cartId and bookId are required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Find the book to verify it exists
    const book = await db.collection('books').findOne({ id: bookId });
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Find existing cart or create new one
    const existingCart = await db.collection<CartDocument>('carts').findOne({ cartId });
    
    if (existingCart) {
      // Check if item already exists in cart
      const existingItemIndex = existingCart.items.findIndex(item => item.bookId === bookId);
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        existingCart.items[existingItemIndex].quantity += quantity || 1;
      } else {
        // Add new item
        existingCart.items.push({
          bookId,
          quantity: quantity || 1
        });
      }
      
      // Update cart in database
      await db.collection<CartDocument>('carts').updateOne(
        { cartId },
        { 
          $set: { 
            items: existingCart.items,
            updatedAt: new Date()
          } 
        }
      );
    } else {
      // Create new cart
      const newCart: CartDocument = {
        _id: new ObjectId().toString(),
        cartId,
        items: [{
          bookId,
          quantity: quantity || 1
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection<CartDocument>('carts').insertOne(newCart);
    }

    return NextResponse.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

// ✅ ADD THIS METHOD TO UPDATE ITEM QUANTITY
export async function PUT(request: Request) {
  try {
    const { cartId, bookId, quantity } = await request.json();
    
    if (!cartId || !bookId) {
      return NextResponse.json({ error: 'cartId and bookId are required' }, { status: 400 });
    }

    const db = await getDb();
    const cart = await db.collection<CartDocument>('carts').findOne({ cartId });
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(item => item.bookId === bookId);
    
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    
    // If quantity is 0, remove the item
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }

    await db.collection<CartDocument>('carts').updateOne(
      { cartId },
      { 
        $set: { 
          items: cart.items,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// ✅ ADD THIS METHOD TO REMOVE SINGLE ITEM
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');
    const bookId = searchParams.get('bookId');

    if (!cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
    }

    const db = await getDb();
    const cart = await db.collection<CartDocument>('carts').findOne({ cartId });
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (bookId) {
      // Remove specific item
      cart.items = cart.items.filter(item => item.bookId !== bookId);
      
      await db.collection<CartDocument>('carts').updateOne(
        { cartId },
        { 
          $set: { 
            items: cart.items,
            updatedAt: new Date()
          } 
        }
      );
    } else {
      // Clear entire cart
      await db.collection<CartDocument>('carts').deleteOne({ cartId });
    }

    return NextResponse.json({ success: true, message: bookId ? 'Item removed' : 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}

// ✅ KEEP EXISTING GET METHOD (but fix the DELETE name conflict)
// Rename the existing DELETE to DELETE_ALL or keep as is but it will handle both cases
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
    }).filter(item => item !== null);

    return NextResponse.json({ items: enrichedItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}