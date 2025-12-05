// src/app/components/Toast.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Toast() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      setMessage(event.detail.message);
      setType(event.detail.type || 'info');
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    };

    window.addEventListener('showToast', handleShowToast as EventListener);
    
    return () => {
      window.removeEventListener('showToast', handleShowToast as EventListener);
    };
  }, []);

  if (!visible || !message) return null;

  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700'
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  }[type];

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className={`${bgColor} border px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 animate-slideIn`}>
        <span className="text-lg">{icon}</span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="text-gray-500 hover:text-gray-700 ml-4"
        >
          ✕
        </button>
      </div>
    </div>
  );
}