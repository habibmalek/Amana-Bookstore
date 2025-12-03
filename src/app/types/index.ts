// src/app/types/index.ts

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  image: string;
  isbn: string;
  genre: string[];
  tags: string[];
  datePublished: string;
  pages: number;
  language: string;
  publisher: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
}

export interface CartItemDB {
  bookId: string;
  quantity: number;
}

export interface CartDocument {
  _id: string;
  cartId: string;
  items: CartItemDB[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  bookId: string;
  quantity: number;
  addedAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  timestamp: string;
  verified: boolean;
}