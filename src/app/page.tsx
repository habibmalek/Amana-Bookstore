// src/app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import BookGrid from './components/BookGrid';
import { Book } from './types';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/books');
        if (!res.ok) throw new Error('Failed to fetch books');
        const data = await res.json();
        setBooks(data.books || []);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    fetchBooks();
  }, []);

  // Clean add to cart handler for production
  const handleAddToCart = async (bookId: string) => {
    let currentCartId = localStorage.getItem('cartId');
    if (!currentCartId) {
      currentCartId = crypto.randomUUID();
      localStorage.setItem('cartId', currentCartId);
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cartId: currentCartId, 
          bookId, 
          quantity: 1 
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        // Show subtle success feedback instead of alert
        const successEvent = new CustomEvent('showToast', { 
          detail: { message: 'Book added to cart!', type: 'success' } 
        });
        window.dispatchEvent(successEvent);
      } else {
        const errorEvent = new CustomEvent('showToast', { 
          detail: { message: data.error || 'Failed to add to cart', type: 'error' } 
        });
        window.dispatchEvent(errorEvent);
      }
    } catch (error) {
      const errorEvent = new CustomEvent('showToast', { 
        detail: { message: 'Network error. Please try again.', type: 'error' } 
      });
      window.dispatchEvent(errorEvent);
    }
  };

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg mb-12 shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Welcome to Amana Bookstore</h1>
        <p className="text-lg text-gray-600 mb-6">
          Discover academic excellence with our curated collection of textbooks and reference materials.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-blue-600 text-2xl mb-2">📚</div>
            <h3 className="font-bold text-gray-800">Wide Selection</h3>
            <p className="text-sm text-gray-600 mt-1">Textbooks across all academic disciplines</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-blue-600 text-2xl mb-2">⭐</div>
            <h3 className="font-bold text-gray-800">Expert Reviews</h3>
            <p className="text-sm text-gray-600 mt-1">Verified reviews from academics and students</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-blue-600 text-2xl mb-2">🚚</div>
            <h3 className="font-bold text-gray-800">Fast Delivery</h3>
            <p className="text-sm text-gray-600 mt-1">Free shipping on orders over $50</p>
          </div>
        </div>
      </section>
      
      {/* Book Grid */}
      <BookGrid books={books} onAddToCart={handleAddToCart} />
    </div>
  );
}