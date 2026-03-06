import React from 'react';
import { motion } from 'framer-motion';

const ContactUs = ({ setView }) => {
    return (
        <motion.div
            key="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="customer-reg-container"
            style={{ maxWidth: '500px', textAlign: 'center', background: '#fff', color: '#000' }}
        >
            <h1 className="title" style={{ color: '#000', marginBottom: '1.5rem', fontWeight: 800 }}>Customer Support</h1>
            <p style={{ color: '#333', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                For any assistance or queries, please reach out to us directly:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</p>
                    <a href="mailto:rsunkara03@gmail.com" style={{ display: 'block', margin: '8px 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>
                        rsunkara03@gmail.com
                    </a>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Number</p>
                    <a href="tel:+919849924480" style={{ display: 'block', margin: '8px 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>
                        +91 9849924480
                    </a>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#333", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('landing')}
                className="btn-primary"
                style={{
                    marginTop: '3rem',
                    padding: '14px 50px',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                Back to Home
            </motion.button>
        </motion.div>
    );
};

export default ContactUs;
