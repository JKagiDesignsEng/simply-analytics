import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress React Router future flag warnings (already configured in App.js)
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('React Router Future Flag Warning') ||
            args[0].includes('v7_startTransition') ||
            args[0].includes('v7_relativeSplatPath'))
    ) {
        return;
    }
    originalConsoleWarn.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
