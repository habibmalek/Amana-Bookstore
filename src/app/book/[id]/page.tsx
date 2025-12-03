// src/app/book/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Book, Review } from '@/app/types';

export default function BookDetailPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Fetch book and reviews from MongoDB API
  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      const res = await fetch(`/api/books?bookId=${id}`);
      const data = await res.json();
      if (data.book) setBook(data.book);
    };

    const fetchReviews = async () => {
      const res = await fetch(`/api/reviews/${id}`);
      const data = await res.json();
      setReviews(data || []);
    };

    fetchBook();
    fetchReviews();
  }, [id]);

  // ✅ THIS IS THE CORRECT "Add to Cart" HANDLER
const handleAddToCart = async () => {
  if (!book) return;

  // Use existing cartId or create one
  let cartId = localStorage.getItem('cartId');
  if (!cartId) {
    cartId = crypto.randomUUID();
    localStorage.setItem('cartId', cartId);
  }

  // ✅ POST to MongoDB API
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartId, bookId: book.id, quantity }),
  });

  if (res.ok) {
    // Notify navbar
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    // Go to cart
    router.push('/cart');
  } else {
    alert('Failed to add to cart');
  }
};

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          if (i < full) return <span key={i} className="text-yellow-400">★</span>;
          if (i === full && hasHalf) return <span key={i} className="text-yellow-400">½</span>;
          return <span key={i} className="text-gray-300">☆</span>;
        })}
      </div>
    );
  };

  const formatDate = (ts: string) => new Date(ts).toLocaleDateString();

  if (!book) return <div className="py-20 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-200 h-96 flex items-center justify-center text-gray-400 text-8xl">📚</div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold">{book.title}</h1>
          <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
          <div className="mb-4">
            {renderStars(book.rating)} ({book.reviewCount} reviews)
          </div>
          <p className="mb-6">{book.description}</p>
          <div className="mb-4">
            {book.genre.map(g => (
              <span key={g} className="inline-block bg-gray-200 px-2 py-1 rounded mr-2 mb-2">
                {g}
              </span>
            ))}
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-6">${book.price.toFixed(2)}</p>
          <div className="flex items-center space-x-4 mb-6">
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-2 py-1 border rounded"
            />
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!book.inStock}
            className={`py-3 rounded ${book.inStock ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}
          >
            {book.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <Link href="/" className="mt-6 text-blue-500">
            &larr; Back to Home
          </Link>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="p-4 border rounded">
                <div className="flex items-center mb-2">
                  {renderStars(r.rating)}
                  <span className="text-sm ml-2">{formatDate(r.timestamp)}</span>
                </div>
                <h3 className="font-semibold">{r.title}</h3>
                <p>{r.comment}</p>
                <p className="text-sm text-gray-600 mt-2">by {r.author}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
}