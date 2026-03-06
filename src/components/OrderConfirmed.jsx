import React from 'react';
import { motion } from 'framer-motion';

const OrderConfirmed = ({
    orderDetails,
    lastOrderId,
    setCart,
    setOrderDetails,
    setView
}) => {
    return (
        <motion.div
            key="order-confirmed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-container auth-card"
            style={{ textAlign: 'center' }}
        >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Order Placed!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Delivering to: <strong>{orderDetails.address}</strong></p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Expected by: <strong>{orderDetails.deliveryDate}</strong></p>
            {lastOrderId && <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Order ID: <span className="order-id-highlight">{lastOrderId}</span></p>}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => { setCart([]); setOrderDetails({ address: '', phone: '', deliveryDate: '' }); setView('customer-products'); }}>
                    Continue Shopping
                </button>
            </div>
        </motion.div>
    );
};

export default OrderConfirmed;
