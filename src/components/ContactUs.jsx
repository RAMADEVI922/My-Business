import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ContactUs = ({ setView, customerAdminId }) => {
    const [contactInfo, setContactInfo] = useState({
        storeName: 'Customer Support',
        contactEmail: 'rsunkara03@gmail.com',
        phone: '+91 9849924480'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const { getAdminContactInfo } = await import('../aws-config');
                const info = await getAdminContactInfo(customerAdminId);
                setContactInfo(info);
            } catch (error) {
                console.error('Error fetching contact info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContactInfo();
    }, [customerAdminId]);

    if (loading) {
        return (
            <motion.div
                key="contact-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="customer-reg-container"
                style={{ maxWidth: '500px', textAlign: 'center', background: '#fff', color: '#000' }}
            >
                <div style={{ padding: '3rem' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #f3f3f3', 
                        borderTop: '4px solid #c27835', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '1rem', color: '#666' }}>Loading contact information...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            key="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="customer-reg-container"
            style={{ maxWidth: '500px', textAlign: 'center', background: '#fff', color: '#000' }}
        >
            <h1 className="title" style={{ color: '#000', marginBottom: '1rem', fontWeight: 800 }}>Customer Support</h1>
            <h2 style={{ color: '#c27835', marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.3rem' }}>
                {contactInfo.storeName}
            </h2>
            <p style={{ color: '#333', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                For any assistance or queries, please reach out to us directly:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</p>
                    <a href={`mailto:${contactInfo.contactEmail}`} style={{ display: 'block', margin: '8px 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>
                        {contactInfo.contactEmail}
                    </a>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Number</p>
                    <a href={`tel:${contactInfo.phone}`} style={{ display: 'block', margin: '8px 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>
                        {contactInfo.phone}
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
