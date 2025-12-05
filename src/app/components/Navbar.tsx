// src/app/components/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const updateCartCount = async () => {
    const cartId = localStorage.getItem('cartId');
    
    if (!cartId) {
      setCartCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/cart?cartId=${cartId}`);
      
      if (res.ok) {
        const data = await res.json();
        const count = data.totalItems || 0;
        setCartCount(count);
      } else {
        // If cart not found, clear the cartId
        localStorage.removeItem('cartId');
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateCartCount();
    
    // Listen for cart updates
    const handleCartUpdated = () => {
      updateCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdated);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-10">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition cursor-pointer">
          📚 Amana Bookstore
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            href="/" 
            className={`hover:text-blue-600 transition ${pathname === '/' ? 'text-blue-600 font-semibold' : 'text-gray-700'} cursor-pointer`}
          >
            Home
          </Link>
          
          <Link 
            href="/cart" 
            className={`flex items-center space-x-2 hover:text-blue-600 transition ${pathname === '/cart' ? 'text-blue-600 font-semibold' : 'text-gray-700'} cursor-pointer`}
          >
            <span>My Cart</span>
            {isLoading ? (
              <span className="bg-gray-200 text-gray-800 text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                ...
              </span>
            ) : cartCount > 0 ? (
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            ) : (
              <span className="bg-gray-200 text-gray-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}