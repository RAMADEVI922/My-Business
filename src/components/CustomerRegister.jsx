import React from 'react';
import { motion } from 'framer-motion';
import { SignUp } from '@clerk/react';

/**
 * Customer Registration Component
 * 
 * Uses Clerk SignUp component with the CUSTOMER Clerk instance (mybusiness - lenient-crayfish-17)
 * This component is only rendered when clerk_mode is set to 'customer' in sessionStorage
 * Customer credentials are stored in the customer Clerk account, separate from admin credentials
 */
const CustomerRegister = ({ setView, customerType }) => {
    const title = customerType === 'shop-owner' 
        ? 'Shop Owner - Create Your Account' 
        : 'Customer - Create Your Account';

    return (
        <motion.div
            key="register"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="customer-register-wrapper"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}
        >
            <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                color: '#c27835',
                marginBottom: '1rem',
                textAlign: 'center'
            }}>
                {title}
            </h2>
            <SignUp 
                routing="hash"
                signInUrl="/customer-login"
            />
            <button 
                type="button" 
                onClick={() => setView('customer-login')} 
                className="link-text" 
                style={{ color: '#c27835', fontWeight: 600, marginTop: '1rem' }}
            >
                Already have an account? Login
            </button>
        </motion.div>
    );
};

export default CustomerRegister;
