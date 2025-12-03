/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/cart/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<{ book: any; quantity: number }[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      const cartId = localStorage.getItem('cartId');
      if (!cartId) return;

      const res = await fetch(`/api/cart?cartId=${cartId}`);
      const data = await res.json();
      setCartItems(data.items || []);
    };
    fetchCart();
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl mb-4">Your cart is empty</h1>
        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={item.book.id} className="p-4 border rounded flex justify-between">
            <div>
              <h3>{item.book.title}</h3>
              <p>${item.book.price.toFixed(2)} × {item.quantity}</p>
            </div>
            <p>${(item.book.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 text-xl font-bold">Total: ${totalPrice.toFixed(2)}</div>
      <div className="mt-4 flex gap-4">
        <Link href="/" className="bg-gray-500 text-white px-6 py-2 rounded">Continue Shopping</Link>
        <button
          onClick={() => {
            localStorage.removeItem('cartId');
            setCartItems([]);
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          }}
          className="bg-red-600 text-white px-6 py-2 rounded"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}