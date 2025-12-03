/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/components/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  const updateCartCount = async () => {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
      setCartCount(0);
      return;
    }
    const res = await fetch(`/api/cart?cartId=${cartId}`);
    const data = await res.json();
    const count = data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-10">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Amana Bookstore</Link>
        <div className="flex space-x-4">
          <Link href="/" className={pathname === '/' ? 'text-blue-600 font-semibold' : ''}>Home</Link>
          <Link href="/cart" className="flex items-center">
            My Cart
            {cartCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}