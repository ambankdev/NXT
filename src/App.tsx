import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import RightsAndDuties from './pages/RightsAndDuties';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import RouteMeta from './components/RouteMeta';

/**
 * Routes without a router around them, so the same tree can be rendered by
 * BrowserRouter in the browser and by StaticRouter during prerendering
 * (see src/entry-server.tsx).
 */
export function AppRoutes() {
  return (
    <>
      <RouteMeta />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/rights-and-duties" element={<RightsAndDuties />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      <AppRoutes />
    </Router>
  );
}

export default App;
