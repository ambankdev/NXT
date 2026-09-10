import { Link } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';

/**
 * Header + footer wrapper for the standalone form pages.
 *
 * Mirrors the chrome the legal pages render inline. Those keep their own copies
 * so this change stays contained — worth folding them in here later, since the
 * markup is currently duplicated four times.
 */
export default function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/assets/images/logo-color.png"
                alt="NXT Logo"
                className="h-8 sm:h-10 w-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-12 pt-24">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: '#182C64' }}>
            {title}
          </h1>
          {intro && <p className="text-gray-600 mb-8">{intro}</p>}
          {children}
        </div>
      </main>

      <footer
        className="relative text-white py-6"
        style={{ background: 'linear-gradient(135deg, #182C64 0%, #2E74EA 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
            <img src="/assets/images/logo-white.png" alt="NXT Logo" className="h-8 w-auto" />

            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/1avvD7axin" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <img src="/assets/images/social/facebook.png" alt="Facebook" className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/nxt_leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <img src="/assets/images/social/instagram.png" alt="Instagram" className="w-5 h-5" />
              </a>
              <a href="https://x.com/NXT_Leb" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <img src="/assets/images/social/twitter.png" alt="X" className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/nxt-leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <img src="/assets/images/social/linkedin.png" alt="LinkedIn" className="w-5 h-5" />
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              <Link to="/careers" className="text-white hover:text-gray-300 transition-colors text-sm">Careers</Link>
              <Link to="/contact" className="text-white hover:text-gray-300 transition-colors text-sm">Contact us</Link>
              <Link to="/rights-and-duties" className="text-white hover:text-gray-300 transition-colors text-sm">Rights and Duties</Link>
              <Link to="/terms-and-conditions" className="text-white hover:text-gray-300 transition-colors text-sm">Terms and Conditions</Link>
              <Link to="/privacy-policy" className="text-white hover:text-gray-300 transition-colors text-sm">Privacy and Cookies</Link>
            </div>
          </div>

          <div className="text-white text-sm text-center mt-4">
            ©Copyright 2026 NXT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
