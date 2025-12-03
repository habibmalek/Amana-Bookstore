// src/app/cart/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Book } from '../types';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<{ book: Book; quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      console.log('Fetching cart...');
      
      const cartId = localStorage.getItem('cartId');
      console.log('cartId from localStorage:', cartId);
      
      if (!cartId) {
        console.log('No cartId found, cart is empty');
        setIsLoading(false);
        setCartItems([]);
        return;
      }

      try {
        console.log(`Calling API: /api/cart?cartId=${cartId}`);
        const res = await fetch(`/api/cart?cartId=${cartId}`);
        
        console.log('API Response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('API Response data:', data);
        console.log('Cart items from API:', data.items);
        
        setCartItems(data.items || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Failed to load cart. Please try again.');
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
    
    // Listen for cart updates
    const handleCartUpdated = () => {
      console.log('Cart updated event received');
      fetchCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdated);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, []);

  const handleClearCart = async () => {
    console.log('Clearing cart...');
    localStorage.removeItem('cartId');
    setCartItems([]);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    alert('Cart cleared!');
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-red-600 text-2xl mb-4">⚠️</div>
        <h1 className="text-xl mb-2">Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">🛒</div>
        <h1 className="text-2xl mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some books to get started!</p>
        <Link 
          href="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="space-y-4 mb-8">
        {cartItems.map(item => (
          <div key={`${item.book.id}-${item.quantity}`} className="p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-16 h-24 bg-gray-200 flex items-center justify-center rounded-md">
                <div className="text-2xl">📚</div>
              </div>
              <div>
                <Link 
                  href={`/book/${item.book.id}`}
                  className="font-semibold text-lg hover:text-blue-600"
                >
                  {item.book.title}
                </Link>
                <p className="text-sm text-gray-600">by {item.book.author}</p>
                <p className="text-gray-700 mt-1">
                  <span className="font-medium">${item.book.price.toFixed(2)}</span> × {item.quantity} = 
                  <span className="font-bold ml-1">${(item.book.price * item.quantity).toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {item.quantity} item{item.quantity > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold">Total ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
          <span className="text-3xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link 
            href="/" 
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition text-center font-medium"
          >
            Continue Shopping
          </Link>
          
          <button
            onClick={handleClearCart}
            className="bg-red-100 text-red-700 px-6 py-3 rounded-lg hover:bg-red-200 transition font-medium"
          >
            Clear Cart
          </button>
          
          <button
            onClick={() => alert('Checkout functionality would be implemented here')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Checkout Now
          </button>
        </div>
      </div>
    </div>
  );
}