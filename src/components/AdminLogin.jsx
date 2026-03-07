import React from 'react';
import { motion } from 'framer-motion';
import { SignIn } from '@clerk/react';

/**
 * Admin Login Component
 * 
 * Uses Clerk SignIn component with the ADMIN Clerk instance (my_business_admin - verified-impala-96)
 * This component is only rendered when clerk_mode is set to 'admin' in sessionStorage
 * Admin credentials are stored in the admin Clerk account, separate from customer credentials
 */
const AdminLogin = ({ setView }) => {
    return (
        <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="admin-login-wrapper"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h1 className="title" style={{ color: 'var(--accent-color)' }}>Admin Portal</h1>
                <p className="subtitle">Please sign in to access settings</p>
            </div>
            
            <SignIn 
                routing="hash" 
                forceRedirectUrl="/admin"
            />
            
            <button 
                type="button" 
                onClick={() => setView('landing')} 
                className="link-text" 
                style={{ color: '#888', marginTop: '1rem' }}
            >
                Back to Customer Portal
            </button>
        </motion.div>
    );
};

export default AdminLogin;
