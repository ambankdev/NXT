import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function PrivacyPolicy() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header - Fixed with scrolled state styling */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/assets/images/logo-dark.png"
                alt="NXT Logo" 
                className="h-8 sm:h-10 w-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Added top padding for fixed header */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pt-24">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-8" style={{color: '#182C64'}}>
            Privacy and Cookies Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: December 2024
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{color: '#182C64'}}>
              1. Privacy Commitment
            </h2>
            <p className="text-gray-700 mb-6">
              At NXT, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy and Cookies Policy explains how we collect, use, store, and protect your data when you use our digital wallet services. We believe in transparency and want you to understand exactly how your information is handled.
            </p>
            <p className="text-gray-700 mb-6">
              Your trust is fundamental to our relationship with you. We implement industry-leading security measures and follow strict data protection protocols to safeguard your personal and financial information. We will never sell your personal data to third parties for marketing purposes, and we only share your information when necessary to provide our services or when required by law.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{color: '#182C64'}}>
              2. Information We Collect
            </h2>
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3" style={{color: '#182C64'}}>
                Personal Information
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Name, address, phone number, and email address</li>
                <li>Government-issued identification documents</li>
                <li>Financial information and transaction history</li>
                <li>Device information and IP addresses</li>
                <li>Biometric data for security purposes (where permitted)</li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium mb-3" style={{color: '#182C64'}}>
                Automatically Collected Information
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Usage patterns and app interactions</li>
                <li>Location data (with your permission)</li>
                <li>Device characteristics and operating system</li>
                <li>Network and connection information</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section - Updated Mobile Layout with Dynamic Font Sizing */}
      <footer className="relative text-white py-6" style={{background: 'linear-gradient(135deg, #182C64 0%, #2E74EA 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop Layout - All items on one line */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-8">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/assets/images/logo-light.png" 
                alt="NXT Logo" 
                className="h-8 w-auto"
              />
            </div>

            {/* Social Media Icons with Links */}
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=615805344515528" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/nxt_leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                </svg>
              </a>
              <a href="https://x.com/NXT_Leb" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/nxt-leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.514v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>

            {/* Legal Tabs */}
            <div className="flex space-x-6">
              <Link to="/rights-and-duties" className="text-white hover:text-gray-300 transition-colors text-sm">
                Rights and Duties
              </Link>
              <Link to="/terms-and-conditions" className="text-white hover:text-gray-300 transition-colors text-sm">
                Terms and Conditions
              </Link>
              <Link to="/privacy-policy" className="text-white hover:text-gray-300 transition-colors text-sm">
                Privacy and Cookies
              </Link>
            </div>

            {/* All Rights Reserved */}
            <div className="text-white text-sm">
              © 2024 NXT. All rights reserved.
            </div>
          </div>

          {/* Mobile Layout - Updated Structure with Dynamic Font Sizing */}
          <div className="lg:hidden">
            <div className="flex flex-col space-y-4">
              {/* First Line: Logo and Social Media Icons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src="https://mgx-backend-cdn.metadl.com/generate/images/324538/2026-01-11/ed8c267d-c9bb-49ff-ab06-3c9db3394ea8.png" 
                    alt="NXT Logo" 
                    className="h-8 w-auto"
                  />
                </div>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/profile.php?id=615805344515528" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/nxt_leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                    </svg>
                  </a>
                  <a href="https://x.com/NXT_Leb" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/nxt-leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.514v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Second Line: All Legal Links with Dynamic Font Sizing */}
              <div className="flex justify-center items-center gap-2 flex-wrap text-center">
                <Link to="/rights-and-duties" className="text-white hover:text-gray-300 transition-colors text-xs">
                  Rights and Duties
                </Link>
                <span className="text-white text-xs">•</span>
                <Link to="/terms-and-conditions" className="text-white hover:text-gray-300 transition-colors text-xs">
                  Terms and Conditions
                </Link>
                <span className="text-white text-xs">•</span>
                <Link to="/privacy-policy" className="text-white hover:text-gray-300 transition-colors text-xs">
                  Privacy and Cookies
                </Link>
              </div>

              {/* Third Line: All Rights Reserved */}
              <div className="text-white text-sm text-center">
                © 2024 NXT. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}