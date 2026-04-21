import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';

export default function Index() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Video loading states
  const [video1Loaded, setVideo1Loaded] = useState(false);
  const [video2Loaded, setVideo2Loaded] = useState(false);
  const [video3Loaded, setVideo3Loaded] = useState(false);
  
  // Touch handling for swipe-to-close
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // Video refs for better control
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);

  // Cookie consent state
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // Check cookie consent on mount
  useEffect(() => {
    const cookieConsent = localStorage.getItem('nxt-cookie-consent');
    if (!cookieConsent) {
      setTimeout(() => {
        setShowCookieBanner(true);
      }, 1000);
    }
  }, []);

  // Handle cookie consent
  const handleCookieConsent = (accepted: boolean) => {
    localStorage.setItem('nxt-cookie-consent', accepted ? 'accepted' : 'declined');
    setShowCookieBanner(false);
  };

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced video playback handler
  useEffect(() => {
    const playVideo = async (videoRef: React.RefObject<HTMLVideoElement>, setLoaded: (loaded: boolean) => void) => {
      if (videoRef.current) {
        try {
          videoRef.current.load();
          videoRef.current.addEventListener('loadeddata', () => setLoaded(true));
          videoRef.current.addEventListener('canplay', async () => {
            try { await videoRef.current?.play(); } catch { /* silent */ }
          });
          await videoRef.current.play();
        } catch {
          const playOnInteraction = async () => {
            try {
              await videoRef.current?.play();
              document.removeEventListener('click', playOnInteraction);
              document.removeEventListener('touchstart', playOnInteraction);
            } catch { /* silent */ }
          };
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
        }
      }
    };
    const timer = setTimeout(() => {
      playVideo(video1Ref, setVideo1Loaded);
      playVideo(video2Ref, setVideo2Loaded);
      playVideo(video3Ref, setVideo3Loaded);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      if (sectionId === 'marketing-section') {
        const videoHeight = window.innerHeight;
        const downloadSectionHeight = document.getElementById('download-section')?.offsetHeight || 0;
        window.scrollTo({ top: videoHeight + downloadSectionHeight, behavior: 'smooth' });
      } else if (sectionId === 'pricing-section' || sectionId === 'features-section') {
        const videoHeight = window.innerHeight;
        const downloadSectionHeight = document.getElementById('download-section')?.offsetHeight || 0;
        let scrollPosition = videoHeight + downloadSectionHeight + window.innerHeight + window.innerHeight;
        if (sectionId === 'features-section') {
          const pricingElement = document.getElementById('pricing-section');
          if (pricingElement) scrollPosition += pricingElement.offsetHeight;
        }
        scrollPosition -= headerHeight;
        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: element.offsetTop - headerHeight, behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleLogoError = () => setLogoError(true);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setTouchEnd(e.targetTouches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentTouch = e.targetTouches[0].clientY;
    setTouchEnd(currentTouch);
    const diff = currentTouch - touchStart;
    if (diff > 0) setDragOffset(Math.min(diff, 200));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (touchEnd - touchStart > 100) setMobileMenuOpen(false);
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(0);
    setTouchEnd(0);
  };

  const CustomTick = ({ color = "#8C15E9" }) => (
    <svg width="16" height="15" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.7631 12.253C20.063 15.7537 17.4234 19.05 13.7197 19.7866C11.9133 20.1463 10.0395 19.927 8.36498 19.1598C6.69051 18.3926 5.30077 17.1167 4.39363 15.5137C3.48649 13.9107 3.1082 12.0624 3.31263 10.232C3.51706 8.40149 4.29378 6.68217 5.5322 5.31882C8.07232 2.52105 12.3614 1.75089 15.8621 3.15118" stroke="url(#paint0_linear_2174_13935)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.8606 10.8511L12.3613 14.3518L20.763 5.25" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear_2174_13935" x1="16.8091" y1="3" x2="6.80908" y2="19.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2E74EA"/>
          <stop offset="0.4" stopColor="#2FFFF3"/>
          <stop offset="0.7" stopColor="#2E74EA"/>
          <stop offset="1" stopColor="#182C64"/>
        </linearGradient>
      </defs>
    </svg>
  );

  const CustomCloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="7.5" r="7.25" fill="white" stroke="url(#paint0_linear_3632_13682)" strokeWidth="0.5"/>
      <path d="M10.7498 10.75L7.49976 7.5M7.49976 7.5L4.24976 4.25M7.49976 7.5L10.7498 4.25M7.49976 7.5L4.24976 10.75" stroke="#182C64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear_3632_13682" x1="2.5" y1="12.5" x2="13" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#182C64"/>
          <stop offset="1" stopColor="#2E74EA"/>
        </linearGradient>
      </defs>
    </svg>
  );

  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4 text-lg">Loading video...</p>
      </div>
    </div>
  );

  const alternatingFeatures = [
    {
      title: "Transfer by Location",
      description: "Skip the account details…<br/>If they're nearby, you can send money in seconds to any NXTer around you, using the phone's location.",
      features: ["Send money to nearby friends instantly", "Easy transfers - no account numbers", "Fun way to connect with your NXT network", "Check 'My Bag' to keep track and action your transfers"],
      image: "/assets/images/transfer-location-1.jpg",
      reverse: false
    },
    {
      title: "Transfer via QR",
      description: "Tap. Scan. Done.<br/>From your phone to theirs, in one smooth scan.<br/>Skip the typing, scan their QR and send money in right away.",
      features: ["Pay friends with a simple QR scan", "No cash, no card - Your phone is all you need", "Fast, simple and secure"],
      image: "/assets/images/transfer-qr-2.jpg",
      reverse: true
    },
    {
      title: "Top-up",
      description: "Almost out of funds?<br/>Top up your account in seconds and keep going…<br/>Even better, you can share the link and get topped up in no time.",
      features: ["Balance boost", "Hassle-free", "Secure & safe"],
      image: "/assets/images/top-up-1.jpg",
      reverse: false
    },
    {
      title: "Bill Split",
      description: "Split bills with friends and track payments.<br/>From meals to trips, splitting bills has never been easier….",
      features: ["Instant requests", "Smooth bill sharing", "Payment tracking"],
      image: "/assets/images/bill-split-1.jpg",
      reverse: true
    },
    {
      title: "Quick Balance",
      description: "Because sometimes you just wanna know 'How much?'<br/>With NXT Quick Balance, you can instantly check your preferred accounts from the login screen.<br/>Drag and drop to check your balance in a flash without logging in — A little shortcut for your everyday banking moments.",
      features: ["No login needed", "Effortless glance", "Balance in a blink"],
      image: "/assets/images/quick-balance-4.jpg",
      reverse: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <style>{`
        .pricing-card {
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .pricing-card-content {
          position: relative;
          flex: 0 0 auto;
          height: fit-content;
        }
        .pricing-card-content .pricing-card-icon img {
          transition: transform 0.3s ease-in-out;
          transform: scale(1) rotate(0deg);
        }
        .pricing-card-content:hover .pricing-card-icon img {
          transform: scale(1.1) rotate(5deg) !important;
        }
        .pricing-card-content.xpress:hover .pricing-card-icon img,
        .pricing-card-content.xclusive:hover .pricing-card-icon img {
          transform: scale(1.1) rotate(-5deg) !important;
        }
        .pricing-cards-grid { align-items: start; }
        .download-container-appstore {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .download-container-appstore:hover { border: 2px solid #2E74EA; }
        .download-container-googleplay {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .download-container-googleplay:hover { border: 2px solid #2E74EA; }
        .qr-code-container {
          margin-top: 12px;
          padding: 8px;
          background: white;
          border-radius: 8px;
          display: inline-block;
        }
        .feature-image-container {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform: scale(1.2);
          transition: transform 0.3s ease;
        }
        .feature-image:hover { transform: scale(1.26); }
        .logo-clickable { cursor: pointer; transition: all 0.3s ease; }
        .logo-clickable:hover { transform: scale(1.05); }
        .logo-fade { transition: opacity 0.3s ease; }
        .nav-menu-item { transition: color 0.3s ease; }
        .nav-menu-item:hover { color: rgba(255, 255, 255, 0.7) !important; }
        .nav-menu-item.scrolled { transition: color 0.3s ease; }
        .nav-menu-item.scrolled:hover { color: rgba(24, 44, 100, 0.7) !important; }
        .nav-menu-container {
          position: relative;
          padding: 1.5px;
          border-radius: 9999px;
          background: linear-gradient(80deg, #182C64 0%, #2E74EA 100%);
          transition: all 0.3s ease;
        }
        .nav-menu-inner {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 9999px;
          padding: 3.6px 36px;
          display: flex;
          gap: 48px;
        }
        .mobile-menu-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5); z-index: 60;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(4px);
        }
        .mobile-menu-overlay.open { opacity: 1; visibility: visible; }
        .mobile-menu-overlay.closed { opacity: 0; visibility: hidden; }
        .mobile-menu-sheet {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: linear-gradient(135deg, #182C64 0%, #2E74EA 100%);
          border-radius: 24px 24px 0 0; z-index: 61;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.3);
          max-height: 70vh; overflow: hidden; touch-action: none;
        }
        .mobile-menu-sheet.open { transform: translateY(0); }
        .mobile-menu-sheet.closed { transform: translateY(100%); }
        .mobile-menu-sheet.dragging { transition: none; }
        .mobile-menu-handle {
          width: 40px; height: 4px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 2px; margin: 12px auto 8px;
          cursor: pointer; transition: background 0.2s ease;
        }
        .mobile-menu-handle:hover { background: rgba(255, 255, 255, 0.6); }
        .mobile-menu-content { padding: 0 24px 32px; }
        .mobile-menu-header {
          display: flex; align-items: center; justify-content: center;
          position: relative; padding: 16px 0 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 24px;
        }
        .mobile-menu-title {
          color: white; font-size: 1.25rem; font-weight: 600;
          margin: 0; text-align: center;
        }
        .mobile-menu-close-icon {
          position: absolute; right: 0; cursor: pointer;
          transition: all 0.2s ease; padding: 4px; border-radius: 6px;
        }
        .mobile-menu-close-icon:hover {
          background: rgba(255, 255, 255, 0.1); transform: scale(1.1);
        }
        .mobile-menu-item {
          display: flex; align-items: center; width: 100%;
          padding: 16px 20px; margin: 8px 0;
          background: rgba(255, 255, 255, 0.1); border: none;
          border-radius: 16px; color: white; font-size: 1.1rem;
          font-weight: 500; text-align: left; cursor: pointer;
          transition: all 0.3s ease; backdrop-filter: blur(10px);
        }
        .mobile-menu-item:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .mobile-menu-item:active { transform: translateY(0); }
        .mobile-menu-icon { width: 24px; height: 24px; margin-right: 16px; opacity: 0.9; }
        .hamburger-line {
          display: block; width: 24px; height: 2px;
          background: currentColor; margin: 4px 0;
          transition: all 0.3s ease; transform-origin: center;
        }
        .hamburger.open .hamburger-line:nth-child(2) { opacity: 0; }
        .hamburger.open .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }
        .feature-image-enhanced {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative; overflow: hidden; transform: scale(1.2);
        }
        .feature-image-enhanced::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%);
          transform: translateX(-100%); transition: transform 0.6s ease;
        }
        .feature-image-enhanced:hover::before { transform: translateX(100%); }
        @media (max-width: 768px) {
          .feature-image-container { height: 300px; }
        }
        html { scroll-behavior: smooth; }
        body.menu-open { overflow: hidden; }
        .mobile-legal-links {
          display: flex; justify-content: center; align-items: center;
          gap: 0.5rem; flex-wrap: wrap; text-align: center;
        }
        .mobile-legal-links a { font-size: 0.75rem; white-space: nowrap; transition: all 0.3s ease; }
        @media (max-width: 480px) { .mobile-legal-links a { font-size: 0.6875rem; } }
        @media (max-width: 360px) { .mobile-legal-links a { font-size: 0.625rem; } }
        @media (max-width: 320px) {
          .mobile-legal-links { gap: 0.25rem; }
          .mobile-legal-links a { font-size: 0.5625rem; }
        }
        .video-container {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;
        }
        .video-element {
          position: absolute; top: 50%; left: 50%;
          min-width: 100%; min-height: 100%; width: auto; height: auto;
          transform: translate(-50%, -50%); object-fit: cover;
        }
        .video-desktop { display: block; }
        .video-mobile { display: none; }
        @media (max-width: 768px) {
          .video-desktop { display: none; }
          .video-mobile { display: block; }
        }
        .cookie-banner {
          position: fixed; bottom: 20px; right: 20px; width: 350px;
          max-width: calc(100vw - 40px); background: white;
          border-radius: 16px; padding: 20px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
          z-index: 1000; transform: translateX(400px);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cookie-banner.show { transform: translateX(0); }
        .cookie-banner-text {
          color: #182C64; font-size: 0.875rem; line-height: 1.5; margin-bottom: 16px;
        }
        .cookie-banner-text a {
          color: #182C64; text-decoration: underline;
          transition: color 0.2s ease; font-weight: 500;
        }
        .cookie-banner-text a:hover { color: #2E74EA; }
        .cookie-banner-buttons { display: flex; gap: 8px; flex-direction: row; }
        .cookie-btn {
          padding: 8px 16px; border-radius: 16px; font-weight: 600;
          font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease;
          border: none; flex: 1; text-align: center;
        }
        .cookie-btn-decline {
          background: transparent; color: #182C64;
          border: 2px solid #182C64; order: 1;
        }
        .cookie-btn-decline:hover {
          background: rgba(24, 44, 100, 0.05); transform: translateY(-2px);
        }
        .cookie-btn-accept {
          background: linear-gradient(90deg, #182C64 0%, #2E74EA 100%);
          color: white; order: 2;
        }
        .cookie-btn-accept:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(24, 44, 100, 0.3);
        }
        @media (max-width: 480px) {
          .cookie-banner { width: calc(100vw - 40px); bottom: 10px; right: 20px; }
          .cookie-banner-buttons { flex-direction: row; }
          .cookie-btn { padding: 8px 12px; font-size: 0.7rem; }
        }
      `}</style>

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="cookie-banner show">
          <div className="cookie-banner-text">
            We use cookies to enhance your browsing experience and analyze our traffic. 
            By clicking "Accept", you consent to our use of cookies. 
            Learn more in our <Link to="/privacy-policy">Privacy Policy</Link>.
          </div>
          <div className="cookie-banner-buttons">
            <button className="cookie-btn cookie-btn-decline" onClick={() => handleCookieConsent(false)}>Decline</button>
            <button className="cookie-btn cookie-btn-accept" onClick={() => handleCookieConsent(true)}>Accept</button>
          </div>
        </div>
      )}

      {/* Bottom Sheet Mobile Menu */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : 'closed'}`} onClick={toggleMobileMenu}>
        <div 
          ref={sheetRef}
          className={`mobile-menu-sheet ${mobileMenuOpen ? 'open' : 'closed'} ${isDragging ? 'dragging' : ''}`} 
          style={{ transform: `translateY(${mobileMenuOpen ? dragOffset : 100}%)` }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mobile-menu-handle" onClick={toggleMobileMenu}></div>
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <h3 className="mobile-menu-title">Menu</h3>
              <button className="mobile-menu-close-icon" onClick={toggleMobileMenu} aria-label="Close menu">
                <CustomCloseIcon />
              </button>
            </div>
            <button className="mobile-menu-item" onClick={() => scrollToSection('marketing-section')}>
              <svg className="mobile-menu-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              NXTOne Account
            </button>
            <button className="mobile-menu-item" onClick={() => scrollToSection('pricing-section')}>
              <svg className="mobile-menu-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Plans
            </button>
            <button className="mobile-menu-item" onClick={() => scrollToSection('features-section')}>
              <svg className="mobile-menu-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Why NXT
            </button>
            <button className="mobile-menu-item" onClick={() => scrollToSection('download-section')}>
              <svg className="mobile-menu-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15v-3m0 0v-3m0 3h3m-3 0h-3m6 3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Download App
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner Video */}
      <div className="w-full h-screen relative overflow-hidden">
        <div className="video-container">
          {!video1Loaded && <LoadingSpinner />}
          <video ref={video1Ref} autoPlay muted loop playsInline preload="auto"
            className="video-element video-desktop"
            style={{ opacity: video1Loaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
            <source src="/assets/images/banner-video.mp4" type="video/mp4" />
          </video>
          <video autoPlay muted loop playsInline preload="auto"
            className="video-element video-mobile"
            style={{ opacity: video1Loaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
            <source src="/assets/images/banner-video-mobile.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white"></div>
        </div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-300 ${
          isScrolled ? 'py-3 sm:py-3.5' : 'py-3 sm:py-4'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 relative">
              {!logoError ? (
                <img 
                  src={isScrolled ? "/assets/images/logo-color.png" : "/assets/images/logo-white.png"}
                  alt="NXT Logo" 
                  className={`w-auto logo-clickable logo-fade transition-all duration-300 ${
                    isScrolled ? 'h-8 sm:h-9' : 'h-12 sm:h-14'
                  }`}
                  onClick={scrollToTop}
                  onError={handleLogoError}
                />
              ) : (
                <div 
                  className={`logo-clickable transition-all duration-300 ${
                    isScrolled ? 'h-6 sm:h-10' : 'h-12 sm:h-14'
                  } flex items-center justify-center px-4 rounded-lg font-bold text-2xl ${
                    isScrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
                  }`}
                  onClick={scrollToTop}
                >NXT</div>
              )}
            </div>
            
            {isScrolled ? (
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                <div className="nav-menu-container">
                  <div className="nav-menu-inner">
                    <button onClick={() => scrollToSection('marketing-section')} className="nav-menu-item scrolled transition-colors duration-300 text-[#182C64]">NXTOne Account</button>
                    <button onClick={() => scrollToSection('pricing-section')} className="nav-menu-item scrolled transition-colors duration-300 text-[#182C64]">Plans</button>
                    <button onClick={() => scrollToSection('features-section')} className="nav-menu-item scrolled transition-colors duration-300 text-[#182C64]">Why NXT</button>
                    <button onClick={() => scrollToSection('download-section')} className="nav-menu-item scrolled transition-colors duration-300 text-[#182C64]">Download App</button>
                  </div>
                </div>
              </div>
            ) : (
              <nav className="hidden md:flex space-x-12 absolute left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full transition-all duration-300">
                <button onClick={() => scrollToSection('marketing-section')} className="nav-menu-item transition-colors duration-300 text-white">NXTOne Account</button>
                <button onClick={() => scrollToSection('pricing-section')} className="nav-menu-item transition-colors duration-300 text-white">Plans</button>
                <button onClick={() => scrollToSection('features-section')} className="nav-menu-item transition-colors duration-300 text-white">Why NXT</button>
                <button onClick={() => scrollToSection('download-section')} className="nav-menu-item transition-colors duration-300 text-white">Download App</button>
              </nav>
            )}

            <div className="md:hidden">
              <button 
                className={`hamburger p-2 ${mobileMenuOpen ? 'open' : ''} ${isScrolled ? 'text-[#182C64]' : 'text-white'}`}
                onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Download Section */}
        <section id="download-section" className="py-20 bg-gray-50 dark:bg-slate-800 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center">
              <ScrollReveal animation="fade-up">
                <h2 className="text-3xl md:text-4xl font-bold mb-12" style={{color: '#182C64'}}>
                  Download your <span style={{color: '#8C15E9'}}>NXT</span> move
                </h2>
              </ScrollReveal>
              
              <div className="flex flex-col sm:flex-row gap-16 justify-center items-center max-w-5xl mx-auto">
                <ScrollReveal animation="fade-up" delay={150}>
                  <div className="flex flex-col items-center">
                    <a href="#" className="download-container-appstore flex items-center justify-center space-x-2 bg-white text-[#182C64] px-4 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-lg w-64 h-24">
                      <img src="/assets/images/apple.png" alt="App Store" className="w-24 h-24 object-contain ml-1"/>
                      <div className="text-left ml-1">
                        <div className="text-xs">Download on the</div>
                        <div className="text-sm font-semibold">App Store</div>
                      </div>
                    </a>
                    <div className="qr-code-container" style={{marginTop: "24px"}}>
                      <img src="/assets/images/qr-appstore.png" alt="App Store QR Code" className="w-32 h-32 rounded" />
                    </div>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal animation="fade-up" delay={300}>
                  <div className="flex flex-col items-center">
                    <a href="#" className="download-container-googleplay flex items-center justify-center space-x-2 bg-white text-[#182C64] px-4 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-lg w-64 h-24">
                      <img src="/assets/images/android.png" alt="Google Play" className="w-24 h-24 object-contain ml-1"/>
                      <div className="text-left ml-1">
                        <div className="text-xs">Get it on</div>
                        <div className="text-sm font-semibold">Google Play</div>
                      </div>
                    </a>
                    <div className="qr-code-container" style={{marginTop: "24px"}}>
                      <img src="/assets/images/qr-googleplay.png" alt="Google Play QR Code" className="w-32 h-32 rounded" />
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* First Marketing Banner Section */}
        <section id="marketing-section" className="sticky top-[56px] h-[calc(100vh-56px)] relative overflow-hidden bg-gray-900" style={{zIndex: 5}}>
          <div className="video-container">
            {!video2Loaded && <LoadingSpinner />}
            <video ref={video2Ref} autoPlay muted loop playsInline preload="auto"
              className="video-element video-desktop"
              style={{ opacity: video2Loaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
              <source src="/assets/images/Video2.mp4" type="video/mp4" />
            </video>
            <video autoPlay muted loop playsInline preload="auto"
              className="video-element video-mobile"
              style={{ opacity: video2Loaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
              <source src="/assets/images/Video2-mobile.mp4" type="video/mp4" />
            </video>
          </div>
        </section>

        {/* Second Marketing Banner Section */}
        <section className="sticky top-[56px] h-[calc(100vh-56px)] relative overflow-hidden bg-gray-800" style={{zIndex: 6}}>
          <div className="video-container">
            {!video3Loaded && <LoadingSpinner />}
            <video ref={video3Ref} autoPlay muted loop playsInline preload="auto"
              className="video-element video-desktop"
              style={{ opacity: video3Loaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
              <source src="/assets/images/Video3.mp4" type="video/mp4" />
            </video>
            <video autoPlay muted loop playsInline preload="auto"
              className="video-element video-mobile"
              style={{ opacity: video3Loaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
              <source src="/assets/images/Video3-mobile.mp4" type="video/mp4" />
            </video>
          </div>
        </section>

        {/* Container for remaining content */}
        <div className="relative bg-white" style={{zIndex: 30}}>
          {/* Pricing Cards Section */}
          <section id="pricing-section" className="py-24">
            <div className="max-w-7xl mx-auto px-8 sm:px-12 w-full">
              <ScrollReveal animation="fade-up">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{color: '#182C64'}}>
                    All what you need is your <span style={{color: '#8C15E9'}}>NXTOne</span> account
                  </h2>
                  <p className="text-3xl max-w-3xl mx-auto" style={{color: '#182C64'}}>
                    Select your favorite <span style={{color: '#2E74EA', fontWeight: '600'}}>NXT</span> plan to unlock great benefits
                  </p>
                </div>
              </ScrollReveal>

              {/* Desktop Cards Grid */}
              <div className="hidden lg:flex lg:justify-center lg:items-start lg:gap-12 max-w-6xl mx-auto pricing-cards-grid">
                {/* XZERO Card */}
                <ScrollReveal animation="fade-up" delay={100} className="pricing-card flex-1 max-w-sm">
                  <div className="pricing-card-content bg-gray-50 rounded-2xl px-2 pb-6 transform hover:scale-105 transition-all duration-300 border border-solid" 
                       style={{ borderColor: '#2E74EA', borderWidth: '1px', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', paddingTop: '0.125rem' }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.borderColor = 'transparent';
                         e.currentTarget.style.background = 'linear-gradient(#f8fafc, #f8fafc) padding-box, linear-gradient(45deg, rgba(140, 21, 233, 0.7) 20%, rgba(47, 255, 243, 1) 70%, rgba(46, 116, 234, 1) 80%) border-box';
                         e.currentTarget.style.border = '3px solid transparent';
                         e.currentTarget.style.borderRadius = '1rem';
                         e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(47, 255, 243, 0.4)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.borderColor = '#2E74EA';
                         e.currentTarget.style.background = '#f8fafc';
                         e.currentTarget.style.border = '1px solid #2E74EA';
                         e.currentTarget.style.borderRadius = '1rem';
                         e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                       }}>
                    <div className="text-center" style={{marginBottom: '26px'}}>
                      <div className="flex justify-center items-center mx-auto pricing-card-icon" style={{width: '130px', height: '130px', marginTop: '-25px', marginBottom: '-35px'}}>
                        <img src="/assets/icons/xzero-icon.png" alt="XZERO" className="object-contain" style={{width: '130px', height: '130px'}} />
                      </div>
                      <div className="text-base" style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Free</div>
                      <div className="text-sm" style={{color: 'transparent', height: '1.25rem'}}>&nbsp;</div>
                    </div>
                    <div className="space-y-3 mb-8 px-2">
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Free virtual debit card</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Interest earning account</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button className="w-3/5 text-white font-bold py-2 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg text-sm"
                              style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)'}}>Get NXT</button>
                    </div>
                  </div>
                </ScrollReveal>

                {/* XPRESS Card */}
                <ScrollReveal animation="fade-up" delay={250} className="pricing-card flex-1 max-w-sm">
                  <div className="pricing-card-content xpress bg-gray-50 rounded-2xl px-2 pb-6 transform hover:scale-105 transition-all duration-300 border border-solid" 
                       style={{ borderColor: '#2E74EA', borderWidth: '1px', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', paddingTop: '0.125rem' }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.borderColor = 'transparent';
                         e.currentTarget.style.background = 'linear-gradient(#f8fafc, #f8fafc) padding-box, linear-gradient(45deg, rgba(140, 21, 233, 0.7) 20%, rgba(47, 255, 243, 1) 70%, rgba(46, 116, 234, 1) 80%) border-box';
                         e.currentTarget.style.border = '3px solid transparent';
                         e.currentTarget.style.borderRadius = '1rem';
                         e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(47, 255, 243, 0.4)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.borderColor = '#2E74EA';
                         e.currentTarget.style.background = '#f8fafc';
                         e.currentTarget.style.border = '1px solid #2E74EA';
                         e.currentTarget.style.borderRadius = '1rem';
                         e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                       }}>
                    <div className="text-center" style={{marginBottom: '26px'}}>
                      <div className="flex justify-center items-center mx-auto pricing-card-icon" style={{width: '130px', height: '130px', marginTop: '-25px', marginBottom: '-35px'}}>
                        <img src="/assets/icons/xpress-icon.png" alt="XPRESS" className="object-contain" style={{width: '130px', height: '130px'}} />
                      </div>
                      <div className="text-base" style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>2 USD</div>
                      <div className="text-sm" style={{color: '#182C64'}}>per month</div>
                    </div>
                    <div className="space-y-3 mb-8 px-2">
                      <div className="flex items-center text-sm" style={{color: '#2E74EA'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Everything in XZERO</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Free Platinum debit card</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Up to 1% cash back*</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button className="w-3/5 text-white font-bold py-2 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg text-sm"
                              style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)'}}>Get NXT</button>
                    </div>
                  </div>
                </ScrollReveal>

                {/* XCLUSIVE Card */}
                <ScrollReveal animation="fade-up" delay={400} className="pricing-card flex-1 max-w-sm">
                  <div className="pricing-card-content xclusive bg-gray-50 rounded-2xl px-2 pb-6 transform hover:scale-105 transition-all duration-300 border border-solid" 
                       style={{ borderColor: '#2E74EA', borderWidth: '1px', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', paddingTop: '0.125rem' }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.borderColor = 'transparent';
                         e.currentTarget.style.background = 'linear-gradient(#f8fafc, #f8fafc) padding-box, linear-gradient(45deg, rgba(140, 21, 233, 0.7) 20%, rgba(47, 255, 243, 1) 70%, rgba(46, 116, 234, 1) 80%) border-box';
                         e.currentTarget.style.border = '3px solid transparent';
                         e.currentTarget.style.borderRadius = '1rem';
                         e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(47, 255, 243, 0.4)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.borderColor = '#2E74EA';
                         e.currentTarget.style.background = '#f8fafc';
                         e.currentTarget.style.border = '1px solid #2E74EA';
                         e.currentTarget.style.borderRadius = '1rem';
                         e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                       }}>
                    <div className="text-center" style={{marginBottom: '26px'}}>
                      <div className="flex justify-center items-center mx-auto pricing-card-icon" style={{width: '130px', height: '130px', marginTop: '-25px', marginBottom: '-35px'}}>
                        <img src="/assets/icons/xclusive-icon.png" alt="XCLUSIVE" className="object-contain" style={{width: '130px', height: '130px'}} />
                      </div>
                      <div className="text-base" style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>120 USD</div>
                      <div className="text-sm" style={{color: '#182C64'}}>per year</div>
                    </div>
                    <div className="space-y-3 mb-8 px-2">
                      <div className="flex items-center text-sm" style={{color: '#2E74EA'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Everything in XPRESS</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Free Visa Infinite credit card**</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Travel insurance</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Airport lounge access</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Concierge service</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center" style={{backgroundColor: 'transparent'}}><CustomTick color="#8C15E9" /></div>
                        <span>Dedicated relationship manager</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button className="w-3/5 text-white font-bold py-2 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg text-sm"
                              style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)'}}>Get NXT</button>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-8 px-6">
                <ScrollReveal animation="fade-up" delay={100} className="pricing-card">
                  <div className="pricing-card-content bg-gray-50 rounded-2xl px-2 pb-6 border" 
                       style={{ borderColor: '#2E74EA', borderWidth: '1px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', paddingTop: '0.125rem' }}>
                    <div className="text-center" style={{marginBottom: '26px'}}>
                      <div className="flex justify-center pricing-card-icon" style={{marginTop: '-15px', marginBottom: '-35px'}}>
                        <img src="/assets/icons/xzero-icon.png" alt="XZERO" className="object-contain" style={{width: '130px', height: '130px'}} />
                      </div>
                      <div className="text-base" style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Free</div>
                      <div className="text-sm" style={{color: 'transparent', height: '1.25rem'}}>&nbsp;</div>
                    </div>
                    <div className="space-y-2 mb-6 px-2">
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Free virtual debit card</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Interest earning account</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button className="w-3/5 text-white font-bold py-2 rounded-xl text-sm transform hover:scale-105 transition-all duration-300"
                              style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)'}}>Get NXT</button>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={200} className="pricing-card">
                  <div className="pricing-card-content bg-gray-50 rounded-2xl px-2 pb-6 border" 
                       style={{ borderColor: '#2E74EA', borderWidth: '1px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', paddingTop: '0.125rem' }}>
                    <div className="text-center" style={{marginBottom: '26px'}}>
                      <div className="flex justify-center mb-0 pricing-card-icon" style={{marginBottom: '-35px'}}>
                        <img src="/assets/icons/xpress-icon.png" alt="XPRESS" className="object-contain" style={{width: '130px', height: '130px'}} />
                      </div>
                      <div className="text-base" style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>2 USD</div>
                      <div className="text-sm" style={{color: '#182C64'}}>per month</div>
                    </div>
                    <div className="space-y-2 mb-6 px-2">
                      <div className="flex items-center text-sm" style={{color: '#2E74EA'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Everything in XZERO</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Free Platinum debit card</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Up to 1% cash back*</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button className="w-3/5 text-white font-bold py-2 rounded-xl text-sm transform hover:scale-105 transition-all duration-300"
                              style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)'}}>Get NXT</button>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={300} className="pricing-card">
                  <div className="pricing-card-content bg-gray-50 rounded-2xl px-2 pb-6 shadow-2xl border"
                       style={{ borderColor: '#2E74EA', borderWidth: '1px', paddingTop: '0.125rem' }}>
                    <div className="text-center" style={{marginBottom: '26px'}}>
                      <div className="flex justify-center mb-0 pricing-card-icon" style={{marginBottom: '-35px'}}>
                        <img src="/assets/icons/xclusive-icon.png" alt="XCLUSIVE" className="object-contain" style={{width: '130px', height: '130px'}} />
                      </div>
                      <div className="text-base" style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>120 USD</div>
                      <div className="text-sm" style={{color: '#182C64'}}>per year</div>
                    </div>
                    <div className="space-y-2 mb-6 px-2">
                      <div className="flex items-center text-sm" style={{color: '#2E74EA'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Everything in XPRESS</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Free Infinite credit card**</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Travel insurance</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Airport lounge access</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Concierge service</span>
                      </div>
                      <div className="flex items-center text-sm" style={{color: '#182C64'}}>
                        <div className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"><CustomTick color="#8C15E9" /></div>
                        <span>Dedicated relationship manager</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button className="w-3/5 text-white font-bold py-2 rounded-xl text-sm transition-all duration-300"
                              style={{background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)'}}>Get NXT</button>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Disclaimers */}
              <ScrollReveal animation="fade-in" delay={500}>
                <div className="mt-12 text-center space-y-2 px-4">
                  <p className="text-xs text-[#182C64]">
                    * Cashback is awarded at a rate of 0.75% on local POS and online transactions, and 1% on international POS and online transactions.
                  </p>
                  <p className="text-xs text-[#182C64]">
                    ** Credit card and credit limits are granted at the Bank's sole discretion and approval.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Alternating Picture/Text Features Section */}
          <div style={{borderTop: "1px solid #182C64"}}></div>
          <section id="features-section" className="py-20" style={{backgroundColor: '#FFFFFF'}}>
            <div className="w-full">
              <ScrollReveal animation="fade-up" className="text-center mb-16 px-4 sm:px-6">
                <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{color: '#182C64'}}>
                  Everything you need in <span style={{color: '#8C15E9'}}>one app</span>
                </h2>
              </ScrollReveal>

              {alternatingFeatures.map((feature, index) => (
                <div key={index} className="py-16" style={{backgroundColor: '#FFFFFF'}}>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <ScrollReveal animation="fade-up" className={feature.reverse ? 'lg:order-2' : 'lg:order-1'}>
                      <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#182C64'}}>
                        {feature.title}
                      </h3>
                      <div className="mb-8 leading-relaxed text-lg" 
                           style={{color: '#182C64'}}
                           dangerouslySetInnerHTML={{__html: feature.description}} />
                      <div className="space-y-4">
                        {feature.features.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center">
                            <div className="w-6 h-6 rounded-full mr-4 flex items-center justify-center" style={{backgroundColor: 'transparent'}}>
                              <CustomTick color="#8C15E9" />
                            </div>
                            <span className="text-[#182C64]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollReveal>

                    <ScrollReveal animation="scale-in" delay={200} className={feature.reverse ? 'lg:order-1' : 'lg:order-2'}>
                      <div className="feature-image-container">
                        {feature.image ? (
                          <img src={feature.image} alt={feature.title} className="feature-image" />
                        ) : (
                          <div className="feature-image feature-image-enhanced flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <span className="text-white text-2xl font-bold">{feature.title.split(' ')[0]}</span>
                              </div>
                              <p className="text-white/90 font-medium">Feature Preview</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Section - No scroll animation */}
      <footer className="relative text-white py-4" style={{background: 'linear-gradient(135deg, #182C64 0%, #2E74EA 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
            <div className="flex items-center">
              <img src="https://mgx-backend-cdn.metadl.com/generate/images/324538/2026-02-16/2b2f9423-893d-493d-9f43-387134a6307b.png" alt="NXT Logo" className="h-10 w-auto" />
            </div>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=615805344515528" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/nxt_leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/></svg>
              </a>
              <a href="https://x.com/NXT_Leb" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/nxt-leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.514v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
            <div className="flex space-x-6">
              <Link to="/rights-and-duties" className="text-white hover:text-gray-300 transition-colors text-sm">Rights and Duties</Link>
              <Link to="/terms-and-conditions" className="text-white hover:text-gray-300 transition-colors text-sm">Terms and Conditions</Link>
              <Link to="/privacy-policy" className="text-white hover:text-gray-300 transition-colors text-sm">Privacy and Cookies</Link>
            </div>
            <div className="text-white text-sm">©Copyright 2026 NXT. All rights reserved.</div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src="https://mgx-backend-cdn.metadl.com/generate/images/324538/2026-02-16/dc87c50e-c1d2-4973-adb6-a9df92279f73.png" alt="NXT Logo" className="h-8 w-auto" />
                </div>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/profile.php?id=615805344515528" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/nxt_leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/></svg>
                  </a>
                  <a href="https://x.com/NXT_Leb" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/company/nxt-leb/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.514v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>
              <div className="mobile-legal-links">
                <Link to="/rights-and-duties" className="text-white hover:text-gray-300 transition-colors">Rights and Duties</Link>
                <span className="text-white">•</span>
                <Link to="/terms-and-conditions" className="text-white hover:text-gray-300 transition-colors">Terms and Conditions</Link>
                <span className="text-white">•</span>
                <Link to="/privacy-policy" className="text-white hover:text-gray-300 transition-colors">Privacy and Cookies</Link>
              </div>
              <div className="text-white text-sm text-center">©Copyright 2026 NXT. All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}