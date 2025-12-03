// src/app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import BookGrid from './components/BookGrid';
import { Book } from './types';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data.books || []);
    };
    fetchBooks();
  }, []);

  const handleAddToCart = (bookId: string) => {
    // Handled per-book page; no-op here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center bg-blue-100 p-8 rounded-lg mb-12 shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Welcome to the Amana Bookstore!</h1>
        <p className="text-lg text-gray-600">
          Your one-stop shop for the best books.
        </p>
      </section>
      <BookGrid books={books} onAddToCart={handleAddToCart} />
    </div>
  );
}