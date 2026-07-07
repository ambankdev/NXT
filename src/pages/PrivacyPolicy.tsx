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
                src="/assets/images/logo-color.png"
                alt="NXT Logo" 
                className="h-8 sm:h-10 w-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Added top padding for fixed header */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pt-24">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-8" style={{color: '#182C64'}}>
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              We appreciate the trust you place in us when sharing your personal data. The security and confidentiality of that data are very important to us. In this document, we will explain how we collect, use and protect your personal data in accordance with applicable Lebanese laws and regulations specifically law No. 81/2018, BDL circulars, and international data protection standards.
            </p>
            <p className="text-gray-700 mb-6">
              We will also explain what rights you have with regards to your personal data and how you can exercise those rights.
            </p>
            <p className="text-gray-700 mb-4">
              We collect personal data from you for one or more of the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>To provide you with information or services that you have requested or which we think may be relevant to a subject in which you have demonstrated an interest;</li>
              <li>To initiate and complete commercial transactions with you, or the entity that you represent, for the purchase of products and/or services;</li>
              <li>To fulfil a contract that we have entered into with you or with the entity that you represent;</li>
              <li>To ensure the security and safe operation of our website and underlying business infrastructure, and</li>
              <li>To manage any communication between you and us.</li>
            </ul>
            <p className="text-gray-700 mb-8">
              We provide below more details about the data that we collect for each of these purposes, the lawful basis for doing so, and the period for which we will retain each type of data.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{color: '#182C64'}}>
              Technical Information
            </h2>
            <p className="text-gray-700 mb-4">
              In addition, and in order to ensure that each visitor to any of our websites can use and navigate the site effectively, we collect the following:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Technical information, including the Internet Protocol (IP) address used to connect your device to the Internet;</li>
              <li>Your login information, browser type and version, time zone setting, browser plug-in types and versions;</li>
              <li>Operating system and platform;</li>
              <li>Information about your visit, including the Uniform Resource Locators (URL) clickstream to, though, and from our site.</li>
            </ul>
            <p className="text-gray-700 mb-8">
              Our cookies policy, which can be viewed from our web site, describes in detail how we use cookies.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{color: '#182C64'}}>
              Your Rights
            </h2>
            <p className="text-gray-700 mb-4">
              We identify your rights in respect of the personal data that we collect and describe how you can exercise those rights, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Right to access and obtain a copy of your personal data</li>
              <li>Right to request correction of inaccurate or incomplete data</li>
              <li>Right to request deletion of your personal data, subject to legal retention requirements</li>
            </ul>
            <p className="text-gray-700 mb-8">
              To exercise any of these rights, you may contact us at: <a href="mailto:connect@mynxt.com" className="text-[#2E74EA] hover:underline">connect@mynxt.com</a>
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{color: '#182C64'}}>
              Lawful basis for the processing of personal data
            </h2>
            <p className="text-gray-700 mb-6">
              We describe below the various forms of personal data we collect and the lawful basis for processing this data. Our business architecture, accounting and systems infrastructure and compliance organization means that all personal data is processed on common, Group-wide platforms. We have processes in place to make sure that only those people in our organization who need to access your data can do so. A number of data elements are collected for multiple purposes, as shown below. Some data may be shared with third parties and, where this happens, this is also identified below. Sharing is limited to what is necessary and subject to confidentiality and data protection obligations.
            </p>
            <p className="text-gray-700 mb-6">
              All processing is performed in compliance with Lebanese Law No. 81/2018 and, where relevant, with the principles of the EU General Data Protection Regulation (GDPR).
            </p>
            <p className="text-gray-700 mb-4">
              When we process on the lawful basis of legitimate interest, we apply the following test to determine whether it is appropriate:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
              <li><span className="font-medium" style={{color: '#182C64'}}>The purpose test</span> – is there a legitimate interest behind the processing?</li>
              <li><span className="font-medium" style={{color: '#182C64'}}>Necessity test</span> – is the processing necessary for that purpose?</li>
              <li><span className="font-medium" style={{color: '#182C64'}}>Balancing test</span> – is the legitimate interest overridden, or not, by the individual's interests, rights or freedoms?</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4" style={{color: '#182C64'}}>
              Data collection process
            </h2>
            <ol className="list-decimal pl-6 space-y-4 text-gray-700 mb-8">
              <li>
                Data collection that includes client information such as name, location, email, and business sector to deliver requested services based on contractual fulfilment, and to send related updates under legitimate interest. Phone numbers and personal contact information are also collected for follow-up purposes, under legitimate interest or consent, respectively. All data is shared internally only. The retention period is up to 10 years from the collection date.
              </li>
              <li>
                Transactional information such as personal and banking details are collected to process purchases, fulfil accounting obligations, and support legal claims, based on contractual performance, statutory obligations, or legitimate interest. The retention period is up to 10 years from the collection date.
              </li>
              <li>
                Payment card data such as account number, cardholder name, and expiration date are collected to complete transactions and may be shared with card companies. The retention period is up to 10 years from the collection date.
              </li>
              <li>
                Security information is gathered to protect systems from cyber threats under legitimate interest, and may be shared with relevant technical entities. Data is retained as per legal time limits.
              </li>
              <li>
                Communication data is used to follow up on user inquiries, also under legitimate interest, and shared internally or with professional advisers. Data is retained as per legal time limits.
              </li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4" style={{color: '#182C64'}}>
              Push Notifications
            </h2>
            <p className="text-gray-700 mb-8">
              We may send you push notifications to provide service-related updates such as transaction notifications, security alerts, authentication requests and service updates. To enable these notifications, we may collect and process device identifiers and push notification tokens associated with your device. You may manage your notification preferences through your device settings or within the Application.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{color: '#182C64'}}>
              Location Data
            </h2>
            <p className="text-gray-700 mb-8">
              With your permission, the Application may collect and process precise location data while the Application is in use and, where enabled on your device, where required for specific services, while the Application is running in the background. Such information may be used to provide location-based features and services, including "Send Money by Location" functionality, enhance safety and security, and improve the user experience. You may withdraw or modify your location permissions at any time through your device settings. If you disable location access, some features of the Application may not function properly.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{color: '#182C64'}}>
              Third-Party Service Providers
            </h2>
            <p className="text-gray-700 mb-4">
              We may disclose certain personal information to third-party service providers that perform services on our behalf, maintain security, prevent fraud or support the operation of the Application. This disclosure of personal information is only as reasonably necessary for service providers to perform services for us and it is subject to contractual restrictions on confidentiality and security. Service providers are not authorized to use or disclose your personal information for their own independent marketing or other purposes. These service providers may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Identity verification and biometric authentication providers: Uqudo (ID and passport scanning) and AWS (facial liveness)</li>
              <li>Push notification service providers: OneSignal and Firebase Cloud Messaging</li>
              <li>Attribution and deep-linking service providers: Branch</li>
              <li>Customer support and communication service providers: Crisp</li>
              <li>Application security, fraud prevention and telemetry service providers: Talsec (freeRASP)</li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-6" style={{color: '#182C64'}}>
              Cookies Policy
            </h2>

            <h3 className="text-xl font-semibold mb-3" style={{color: '#182C64'}}>
              What are cookies?
            </h3>
            <p className="text-gray-700 mb-8">
              A cookie is a small file of letters and numbers that is downloaded on to your device when you visit a website. Cookies are used by many websites and can do a number of things, like remembering your preferences, recording what you have chosen as options, and counting the number of people looking at a website.
            </p>

            <h3 className="text-xl font-semibold mb-3" style={{color: '#182C64'}}>
              Why do we use them?
            </h3>
            <p className="text-gray-700 mb-4">
              We use cookies for a number of reasons, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>To help us improve your experience when using our website</li>
              <li>To remember your preferences so there is no need for you to select the same customized options on each visit</li>
              <li>To analyze how well our website is performing</li>
              <li>To learn more about the way you interact with our website</li>
            </ul>
            <p className="text-gray-700 mb-8">
              The key reason for using cookies, however, is to make our website more convenient, efficient and user-friendly for you.
            </p>

            <h3 className="text-xl font-semibold mb-3" style={{color: '#182C64'}}>
              Types of cookies we use
            </h3>
            <ol className="list-decimal pl-6 space-y-4 text-gray-700 mb-8">
              <li>
                <span className="font-medium" style={{color: '#182C64'}}>Necessary Cookies:</span> These cookies ensure the website functions properly. They do not identify you as an individual, but rejecting them may affect website performance.
              </li>
              <li>
                <span className="font-medium" style={{color: '#182C64'}}>Performance Cookies:</span> These cookies collect anonymous data on user interactions such as time spent and pages visited to insure site performance. They do not identify you as an individual.
              </li>
              <li>
                <span className="font-medium" style={{color: '#182C64'}}>Functionality Cookies:</span> These cookies store user preferences like language or username to provide a more personalized online experience and may collect personally identifiable information disclosed by the user, such as usernames or user IDs.
              </li>
            </ol>

            <h3 className="text-xl font-semibold mb-3" style={{color: '#182C64'}}>
              Social media and third-party cookies
            </h3>
            <p className="text-gray-700 mb-6">
              To enrich our website content, we may sometimes embed videos from other social media websites such as YouTube, Facebook, and other providers. As a result, when you visit a page with content embedded, you may be presented with cookies from these websites. AM Bank has no control or liability over these cookies set, please check the relevant third party's cookie policy for more information.
            </p>
            <p className="text-gray-700 mb-8">
              We also offer a widget where content or information can be shared easily on sites like Facebook, Yammer, Twitter, LinkedIn, Google+, and others. These sites may set a cookie when you are logged into their service. AM Bank has no control or liability over these cookies, please check the relevant third party's cookie policy for more information.
            </p>

            <h3 className="text-xl font-semibold mb-3" style={{color: '#182C64'}}>
              How can I control my cookies?
            </h3>
            <p className="text-gray-700 mb-4">
              You can use your web browser to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Delete all cookies</li>
              <li>Block all cookies</li>
              <li>Allow all cookies</li>
              <li>Block third-party cookies</li>
              <li>Clear all cookies when you close the browser</li>
              <li>Open a 'private browsing' / 'incognito' session, which enables you to browse the internet without storing local data</li>
            </ul>
            <p className="text-gray-700 mb-6">
              Changing your cookie settings, including deleting and disabling them, may mean that the functionality of our website and your ability to use some of the features will be affected. You will still be able to use our website but you may not be able to access all of AM Bank content and some of the functions may not operate correctly.
            </p>
            <p className="text-gray-700 mb-6">
              You can also visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-[#2E74EA] hover:underline">www.allaboutcookies.org</a> for details on how to delete or reject cookies and for further information on cookies. To learn about the use of cookies on mobile phones and other devices' browsers, and for details on how to reject or delete such cookies, please refer to your device user manual.
            </p>
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
                src="/assets/images/logo-white.png"
                alt="NXT Logo"
                className="h-8 w-auto"
              />
            </div>

            {/* Social Media Icons with Links */}
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/1avvD7axin" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
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
              ©Copyright 2026 NXT. All rights reserved.
            </div>
          </div>

          {/* Mobile Layout - Updated Structure with Dynamic Font Sizing */}
          <div className="lg:hidden">
            <div className="flex flex-col space-y-4">
              {/* First Line: Logo and Social Media Icons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/assets/images/logo-white.png"
                    alt="NXT Logo"
                    className="h-8 w-auto"
                  />
                </div>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/share/1avvD7axin" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
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
                ©Copyright 2026 NXT. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}