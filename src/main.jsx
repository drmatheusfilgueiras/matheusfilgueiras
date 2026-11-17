import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { registerPublicAgentTools } from '@/lib/agentTools';
import '@/index.css';

const root = document.getElementById('root');
if (root?.hasAttribute('data-prerendered')) {
  ReactDOM.hydrateRoot(root, <App />);
} else {
  ReactDOM.createRoot(root).render(<App />);
}
registerPublicAgentTools();
