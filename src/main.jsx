import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import App from './App.jsx'
import './index.css'
import './mobile-fixes.css'

const CLERK_MODE = sessionStorage.getItem('clerk_mode') || 'customer';
const PUBLISHABLE_KEY = CLERK_MODE === 'admin' 
    ? import.meta.env.VITE_CLERK_ADMIN_PUBLISHABLE_KEY 
    : import.meta.env.VITE_CLERK_CUSTOMER_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn(`Missing Clerk Publishable Key for mode: ${CLERK_MODE}. Falling back to default.`);
}

const FINAL_KEY = PUBLISHABLE_KEY || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ClerkProvider publishableKey={FINAL_KEY} afterSignOutUrl="/">
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ClerkProvider>
    </React.StrictMode>,
)
