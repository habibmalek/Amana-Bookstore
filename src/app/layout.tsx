import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Amana Bookstore',
  description: 'A modern online bookstore built with Next.js and Tailwind CSS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 pt-16`}
        suppressHydrationWarning
      >
        <Toast />
        <Navbar />
        <main>{children}</main>
        
        {/* Script to handle browser extension interference */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove Grammarly and other extension attributes
              if (typeof window !== 'undefined') {
                const observer = new MutationObserver(() => {
                  if (document.body.hasAttribute('data-new-gr-c-s-check-loaded')) {
                    document.body.removeAttribute('data-new-gr-c-s-check-loaded');
                  }
                  if (document.body.hasAttribute('data-gr-ext-installed')) {
                    document.body.removeAttribute('data-gr-ext-installed');
                  }
                });
                
                observer.observe(document.body, { attributes: true });
                
                // Clean up on unmount
                window.addEventListener('beforeunload', () => observer.disconnect());
              }
            `,
          }}
        />
      </body>
    </html>
  );
}