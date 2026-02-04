import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
// import './index.css' // ลบออกถ้าไม่มีไฟล์นี้
import App from './App.js'
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <Router>
        <App />
      </Router>
    </StrictMode>
  );
}
