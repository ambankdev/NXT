import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;

// Production builds ship prerendered HTML (scripts/prerender.mjs), so attach to
// it instead of throwing it away. `vite dev` serves an empty #root — mount fresh.
if (container.hasChildNodes()) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
