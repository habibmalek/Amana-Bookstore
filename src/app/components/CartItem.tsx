// src/app/components/CartItem.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Book } from '../types';

interface CartItemProps {
  item: { book: Book; quantity: number };
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const { book, quantity } = item;
  const subtotal = (book.price * quantity).toFixed(2);

  const handleIncrease = () => {
    onUpdateQuantity(book.id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(book.id, quantity - 1);
    } else {
      // If quantity becomes 0, remove item
      onRemoveItem(book.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-center space-x-4 flex-1">
        <div className="h-24 w-16 bg-gray-200 flex items-center justify-center rounded-md flex-shrink-0">
          <div className="text-2xl text-gray-400">📚</div>
        </div>
        <div className="flex-1">
          <Link href={`/book/${book.id}`} className="text-lg font-semibold text-gray-800 hover:text-blue-600">
            {book.title}
          </Link>
          <p className="text-sm text-gray-600">by {book.author}</p>
          <p className="text-md font-bold text-gray-900 mt-1">${book.price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleDecrease}
            className="px-3 py-1 border rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button 
            onClick={handleIncrease}
            className="px-3 py-1 border rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            +
          </button>
        </div>
        <p className="text-lg font-bold text-gray-900 min-w-[80px] text-right">
          ${subtotal}
        </p>
        <button 
          onClick={() => onRemoveItem(book.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
          title="Remove item"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
