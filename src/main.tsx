import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign ResizeObserver loop limit exceeded error notifications
const resizeObserverLoopErrRe = /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/i;
window.addEventListener(
  'error',
  (e) => {
    if (e.message && resizeObserverLoopErrRe.test(e.message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  },
  true
);

const prevOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (typeof message === 'string' && resizeObserverLoopErrRe.test(message)) {
    return true;
  }
  if (prevOnError) {
    return prevOnError(message, source, lineno, colno, error);
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

