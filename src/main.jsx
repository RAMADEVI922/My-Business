import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import App from './App.jsx'
import './styles/index.css'
import './styles/mobile-fixes.css'

const CLERK_MODE = sessionStorage.getItem('clerk_mode') || 'customer';
const PUBLISHABLE_KEY = CLERK_MODE === 'admin' 
    ? import.meta.env.VITE_CLERK_ADMIN_PUBLISHABLE_KEY 
    : import.meta.env.VITE_CLERK_CUSTOMER_PUBLISHABLE_KEY;

// Logging for debugging authentication flow
console.log('=== Clerk Configuration ===');
console.log('Mode:', CLERK_MODE);
console.log('Using Key:', PUBLISHABLE_KEY ? PUBLISHABLE_KEY.substring(0, 30) + '...' : 'None');

if (CLERK_MODE === 'admin') {
    console.log('Loading Admin Clerk Instance (my_business_admin - verified-impala-96)');
} else {
    console.log('Loading Customer Clerk Instance (mybusiness - lenient-crayfish-17)');
}

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
