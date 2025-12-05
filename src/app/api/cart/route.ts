/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { CartDocument } from "@/app/types";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Helper function to create a new cart ID
function generateCartId(): string {
  return 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

// GET: Fetch cart items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
    }

    const db = await getDb();
    const cart = await db.collection<CartDocument>('carts').findOne({ cartId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch book details for each item in cart
    const bookIds = cart.items.map(item => item.bookId);
    const books = await db.collection('books').find({ 
      id: { $in: bookIds } 
    }).toArray();

    // Create enriched cart items with book details
    const enrichedItems = cart.items.map(item => {
      const book = books.find(b => b.id === item.bookId);
      return {
        ...item,
        book: book || null
      };
    }).filter(item => item.book !== null);

    return NextResponse.json({ 
      items: enrichedItems,
      cartId: cart.cartId,
      totalItems: enrichedItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch cart',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: Add item to cart
export async function POST(request: Request) {
  try {
    const { cartId, bookId, quantity = 1 } = await request.json();
    
    console.log('Adding to cart:', { cartId, bookId, quantity });
    
    if (!bookId) {
      return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Verify book exists
    const book = await db.collection('books').findOne({ id: bookId });
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Generate new cartId if not provided
    let finalCartId = cartId;
    if (!finalCartId) {
      finalCartId = generateCartId();
    }

    // Find existing cart
    const existingCart = await db.collection<CartDocument>('carts').findOne({ 
      cartId: finalCartId 
    });

    if (existingCart) {
      // Check if item already exists
      const existingItemIndex = existingCart.items.findIndex(
        item => item.bookId === bookId
      );

      const updatedItems = [...existingCart.items];
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        updatedItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        updatedItems.push({ bookId, quantity });
      }

      // Update cart
      const result = await db.collection<CartDocument>('carts').updateOne(
        { cartId: finalCartId },
        { 
          $set: { 
            items: updatedItems,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('Update result:', result);
    } else {
      // Create new cart - REMOVE _id field to let MongoDB generate it
      const newCart: any = {
        cartId: finalCartId,
        items: [{ bookId, quantity }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Inserting new cart:', newCart);
      const result = await db.collection<CartDocument>('carts').insertOne(newCart);
      console.log('Insert result:', result);
    }

    return NextResponse.json({ 
      success: true, 
      cartId: finalCartId,
      message: 'Item added to cart' 
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ 
      error: 'Failed to add item to cart',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT: Update item quantity
export async function PUT(request: Request) {
  try {
    const { cartId, bookId, quantity } = await request.json();
    
    if (!cartId || !bookId || quantity === undefined) {
      return NextResponse.json({ 
        error: 'cartId, bookId, and quantity are required' 
      }, { status: 400 });
    }

    if (quantity < 0) {
      return NextResponse.json({ 
        error: 'Quantity cannot be negative' 
      }, { status: 400 });
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

    let updatedItems = [...cart.items];
    
    if (quantity === 0) {
      // Remove item if quantity is 0
      updatedItems.splice(itemIndex, 1);
    } else {
      // Update quantity
      updatedItems[itemIndex].quantity = quantity;
    }

    await db.collection<CartDocument>('carts').updateOne(
      { cartId },
      { 
        $set: { 
          items: updatedItems,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ 
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated'
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ 
      error: 'Failed to update cart',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: Remove item or clear cart
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
      const updatedItems = cart.items.filter(item => item.bookId !== bookId);
      
      if (updatedItems.length === cart.items.length) {
        return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
      }

      await db.collection<CartDocument>('carts').updateOne(
        { cartId },
        { 
          $set: { 
            items: updatedItems,
            updatedAt: new Date()
          } 
        }
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Item removed from cart' 
      });
    } else {
      // Clear entire cart
      await db.collection<CartDocument>('carts').deleteOne({ cartId });
      return NextResponse.json({ 
        success: true, 
        message: 'Cart cleared successfully' 
      });
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ 
      error: 'Failed to clear cart',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}