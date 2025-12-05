// src/app/cart/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Book } from '../types';

interface CartItem {
  book: Book;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
    
    // Listen for cart updates
    const handleCartUpdated = () => {
      console.log('Cart updated event received, refreshing cart...');
      fetchCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdated);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, []);

  const fetchCart = async () => {
    console.log('Fetching cart...');
    
    const cartId = localStorage.getItem('cartId');
    console.log('cartId from localStorage:', cartId);
    
    if (!cartId) {
      console.log('No cartId found, cart is empty');
      setIsLoading(false);
      setCartItems([]);
      setError(null);
      return;
    }

    try {
      console.log(`Calling API: /api/cart?cartId=${cartId}`);
      const res = await fetch(`/api/cart?cartId=${cartId}`);
      
      console.log('API Response status:', res.status);
      
      if (!res.ok) {
        if (res.status === 404) {
          // Cart not found in DB, but localStorage has cartId
          console.log('Cart not found in database, clearing localStorage');
          localStorage.removeItem('cartId');
          setCartItems([]);
        } else {
          throw new Error(`API Error: ${res.status}`);
        }
      } else {
        const data = await res.json();
        console.log('API Response data:', data);
        
        if (data.items && Array.isArray(data.items)) {
          console.log('Cart items from API:', data.items);
          setCartItems(data.items || []);
        } else {
          console.log('No items array in response, setting empty cart');
          setCartItems([]);
        }
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again.');
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (bookId: string, newQuantity: number) => {
    const cartId = localStorage.getItem('cartId');
    
    if (!cartId || newQuantity < 1) {
      return;
    }

    try {
      console.log(`Updating quantity for book ${bookId} to ${newQuantity}`);
      
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cartId, 
          bookId, 
          quantity: newQuantity 
        }),
      });

      if (res.ok) {
        console.log('Quantity updated successfully');
        // Refresh cart data
        await fetchCart();
        // Notify navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        const data = await res.json();
        console.error('Failed to update quantity:', data.error);
        alert(`Failed to update quantity: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (bookId: string) => {
    const cartId = localStorage.getItem('cartId');
    
    if (!cartId) {
      alert('No cart found!');
      return;
    }

    try {
      console.log(`Removing item ${bookId} from cart`);
      
      const res = await fetch(`/api/cart?cartId=${cartId}&bookId=${bookId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        console.log('Item removed successfully');
        // Refresh cart data
        await fetchCart();
        // Notify navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        alert('Item removed from cart!');
      } else {
        const data = await res.json();
        console.error('Failed to remove item:', data.error);
        alert(`Failed to remove item: ${data.error}`);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error removing item. Please try again.');
    }
  };

  const handleClearCart = async () => {
    const cartId = localStorage.getItem('cartId');
    
    if (!cartId) {
      setCartItems([]);
      alert('Cart is already empty!');
      return;
    }

    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      console.log(`Clearing cart ${cartId}`);
      
      const res = await fetch(`/api/cart?cartId=${cartId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        console.log('Cart cleared successfully');
        localStorage.removeItem('cartId');
        setCartItems([]);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        alert('Cart cleared successfully!');
      } else {
        const data = await res.json();
        console.error('Failed to clear cart:', data.error);
        alert(`Failed to clear cart: ${data.error}`);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Error clearing cart. Please try again.');
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold mb-2">Error Loading Cart</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetchCart();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven&rsquo;t added any books to your cart yet.</p>
        <Link 
          href="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block text-lg font-medium"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {cartItems.map((item, index) => (
              <div 
                key={`${item.book.id}-${index}`} 
                className={`p-4 ${index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Book Cover */}
                  <div className="w-full sm:w-32 h-40 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-4xl text-gray-400">📚</div>
                  </div>
                  
                  {/* Book Details */}
                  <div className="flex-1">
                    <Link 
                      href={`/book/${item.book.id}`}
                      className="font-bold text-lg hover:text-blue-600 transition"
                    >
                      {item.book.title}
                    </Link>
                    <p className="text-gray-600 mb-2">by {item.book.author}</p>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(item.book.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.book.reviewCount} reviews)
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.book.genre.slice(0, 2).map(genre => (
                        <span 
                          key={genre} 
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="mb-4 sm:mb-0">
                        <p className="text-lg font-bold text-blue-600">
                          ${item.book.price.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.book.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 transition"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.book.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 transition"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Subtotal */}
                        <p className="font-bold text-lg">
                          ${(item.book.price * item.quantity).toFixed(2)}
                        </p>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.book.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition"
                          aria-label="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => alert('Checkout functionality would be implemented here')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold"
              >
                Proceed to Checkout
              </button>
              
              <Link 
                href="/" 
                className="block w-full text-center border border-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Continue Shopping
              </Link>
              
              <button
                onClick={handleClearCart}
                className="w-full text-red-600 border border-red-300 py-3 rounded-lg hover:bg-red-50 transition font-medium"
              >
                Clear Entire Cart
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Need help?</span> Contact our support team at support@amanabookstore.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}