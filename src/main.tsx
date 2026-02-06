import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { EventLogger } from './tools';

/**
 * Application Entry Point
 * 
 * This file bootstraps the React application by:
 * 1. Initializing the EventLogger to capture custom events
 * 2. Creating a React root from the DOM element with id 'root'
 * 3. Rendering the App component wrapped in React.StrictMode
 * 
 * React.StrictMode enables additional development checks and warnings:
 * - Identifies components with unsafe lifecycles
 * - Warns about legacy string ref API usage
 * - Warns about deprecated findDOMNode usage
 * - Detects unexpected side effects
 * - Detects legacy context API
 */

// Initialize EventLogger to start capturing custom events
EventLogger.getInstance();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
