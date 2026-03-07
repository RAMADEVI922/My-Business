import React from 'react';
import { motion } from 'framer-motion';
import { SignIn } from '@clerk/react';

/**
 * Customer Login Component
 * 
 * Uses Clerk SignIn component with the CUSTOMER Clerk instance (mybusiness - lenient-crayfish-17)
 * This component is only rendered when clerk_mode is set to 'customer' in sessionStorage
 * Customer credentials are stored in the customer Clerk account, separate from admin credentials
 */
const CustomerLogin = ({ setView }) => {
    return (
        <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="customer-login-wrapper"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}
        >
            <SignIn 
                routing="hash"
                signUpUrl="/register"
            />
            <button 
                type="button" 
                onClick={() => setView('login')} 
                className="link-text" 
                style={{ color: '#c27835', fontWeight: 600, marginTop: '1rem' }}
            >
                Are you an admin? Admin Login
            </button>
        </motion.div>
    );
};

export default CustomerLogin;
