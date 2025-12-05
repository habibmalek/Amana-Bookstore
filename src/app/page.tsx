// src/app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import BookGrid from './components/BookGrid';
import { Book } from './types';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data.books || []);
    };
    fetchBooks();
  }, []);

  // ✅ FIXED: Actually add to cart instead of just logging
  const handleAddToCart = async (bookId: string) => {
    console.log(`Adding book ${bookId} to cart...`);
    
    // Use existing cartId or create one
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      cartId = crypto.randomUUID();
      localStorage.setItem('cartId', cartId);
      console.log('Created new cartId:', cartId);
    } else {
      console.log('Using existing cartId:', cartId);
    }

    try {
      console.log('Calling POST /api/cart with:', { cartId, bookId, quantity: 1 });
      
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cartId, 
          bookId, 
          quantity: 1 
        }),
      });

      const data = await res.json();
      console.log('POST /api/cart response:', data);
      
      if (res.ok) {
        console.log('✅ Successfully added to cart!');
        // Notify navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        setTestResult(`✅ Book ${bookId} added to cart successfully! Cart updated.`);
        
        // Show success message briefly
        setTimeout(() => {
          setTestResult('');
        }, 3000);
      } else {
        console.error('❌ Failed to add to cart:', data.error);
        setTestResult(`❌ Failed to add to cart: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      setTestResult(`❌ Error adding to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ✅ Debug test function
  const runCartDebugTest = async () => {
    console.log('🧪 Starting cart debug test...');
    setTestResult('Running debug test...');
    
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      cartId = crypto.randomUUID();
      localStorage.setItem('cartId', cartId);
      console.log('Created new cartId for test:', cartId);
      setTestResult(`Created new cartId: ${cartId}`);
    }
    
    try {
      // Test 1: Add a book to cart
      console.log('🧪 Test 1: Adding book "1" to cart...');
      const postRes = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cartId, 
          bookId: '1', 
          quantity: 2 
        }),
      });
      
      const postData = await postRes.json();
      console.log('POST response:', postData);
      
      if (!postRes.ok) {
        setTestResult(`❌ Test 1 FAILED: ${postData.error || 'Unknown error'}`);
        return;
      }
      
      // Test 2: Fetch cart to verify
      console.log('🧪 Test 2: Fetching cart to verify...');
      const getRes = await fetch(`/api/cart?cartId=${cartId}`);
      const getData = await getRes.json();
      console.log('GET response:', getData);
      
      if (!getRes.ok) {
        setTestResult(`❌ Test 2 FAILED: ${getData.error || 'Unknown error'}`);
        return;
      }
      
      // Test 3: Check MongoDB directly
      console.log('🧪 Test 3: Checking MongoDB...');
      const dbRes = await fetch('/api/books?bookId=1');
      const dbData = await dbRes.json();
      console.log('Book data:', dbData);
      
      if (getData.items && getData.items.length > 0) {
        const bookTitle = getData.items[0]?.book?.title || 'Unknown Book';
        const quantity = getData.items[0]?.quantity || 0;
        setTestResult(`✅ SUCCESS! Cart has ${getData.items.length} items. "${bookTitle}" (Qty: ${quantity}) added to cart.`);
      } else {
        setTestResult('⚠️ Cart was created but items array is empty. Check MongoDB connection.');
      }
      
      // Trigger navbar update
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
    } catch (error) {
      console.error('❌ Debug test error:', error);
      setTestResult(`❌ Debug test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ✅ Test MongoDB connection directly
  const testMongoDBConnection = async () => {
    setTestResult('Testing MongoDB connection...');
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      console.log('MongoDB books response:', data);
      
      if (data.books && data.books.length > 0) {
        setTestResult(`✅ MongoDB connected! Found ${data.books.length} books.`);
      } else {
        setTestResult('⚠️ MongoDB connected but no books found.');
      }
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
      setTestResult(`❌ MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ✅ Clear cart and localStorage
  const clearCartTest = () => {
    localStorage.removeItem('cartId');
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    setTestResult('🛒 Cart cleared from localStorage!');
    console.log('Cart cleared from localStorage');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="bg-blue-100 p-8 rounded-lg mb-12 shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Welcome to the Amana Bookstore!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Your one-stop shop for the best books.
        </p>
        
        {/* Debug Test Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-300 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🛠️ Cart Debugging Tools</h2>
          
          {testResult && (
            <div className={`mb-4 p-3 rounded ${testResult.includes('✅') ? 'bg-green-100 text-green-800' : testResult.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
              <strong>Result:</strong> {testResult}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={runCartDebugTest}
              className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition font-medium"
            >
              🧪 Run Cart Test
            </button>
            
            <button
              onClick={testMongoDBConnection}
              className="bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 transition font-medium"
            >
              🗄️ Test MongoDB
            </button>
            
            <button
              onClick={clearCartTest}
              className="bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 transition font-medium"
            >
              🗑️ Clear Cart
            </button>
            
            <button
              onClick={() => {
                const cartId = localStorage.getItem('cartId');
                setTestResult(cartId ? `Cart ID: ${cartId}` : 'No cart ID found');
                console.log('Current cartId:', cartId);
              }}
              className="bg-yellow-600 text-white px-4 py-3 rounded hover:bg-yellow-700 transition font-medium"
            >
              🔍 Show Cart ID
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Click &rdquo;🧪 Run Cart Test&rdquo; to add a test book to cart</li>
              <li>Click &rdquo;🗄️ Test MongoDB&rdquo; to check database connection</li>
              <li>Check browser Console for detailed logs</li>
              <li>Navigate to Cart page to verify items appear</li>
            </ol>
          </div>
        </div>
      </section>
      
      {/* Book Grid */}
      <BookGrid books={books} onAddToCart={handleAddToCart} />
      
      {/* Current Cart Status (fixed position for easy access) */}
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-300 z-50 max-w-xs">
        <h3 className="font-bold mb-2">🛒 Current Cart Status</h3>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Cart ID:</strong> {localStorage.getItem('cartId') ? 'Set' : 'Not set'}
        </p>
        <button
          onClick={() => {
            const cartId = localStorage.getItem('cartId');
            if (cartId) {
              fetch(`/api/cart?cartId=${cartId}`)
                .then(res => res.json())
                .then(data => {
                  console.log('Cart data:', data);
                  setTestResult(`Cart has ${data.items?.length || 0} items`);
                });
            } else {
              setTestResult('No cart ID found');
            }
          }}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded w-full"
        >
          Check Cart Items
        </button>
      </div>
    </div>
  );
}