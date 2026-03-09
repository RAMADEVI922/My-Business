import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const OrderAddress = ({
    setView,
    orderDetails,
    setOrderDetails,
    handleConfirmOrder,
    orderError,
    cart,
    cartTotal
}) => {
    return (
        <motion.div
            key="order-address"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="order-view"
            style={{ maxWidth: '560px', margin: '0 auto 2rem' }}
        >
            <div style={{ marginBottom: '1.5rem' }}>
                <button onClick={() => setView('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <ArrowLeft size={18} /> Back to Cart
                </button>
            </div>
            <h2 className="title" style={{ color: '#f59e0b', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>📦 Delivery Details</h2>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Fill in your delivery information to complete the order.</p>

            <form onSubmit={handleConfirmOrder} style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                {orderError && (
                    <div style={{ background: '#fff3f3', border: '1px solid #ffa0a0', borderRadius: '8px', padding: '10px 14px', color: '#cc0000', fontSize: '0.9rem' }}>
                        ⚠️ {orderError}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Delivery Address *</label>
                    <textarea
                        rows={3}
                        placeholder="Enter your full delivery address…"
                        className="input-field black-placeholder"
                        style={{ resize: 'vertical', fontFamily: 'inherit', color: '#000000', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 16px', fontSize: '0.95rem', fontWeight: 500 }}
                        value={orderDetails.address}
                        onChange={(e) => setOrderDetails(prev => ({ ...prev, address: e.target.value }))}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Pincode *</label>
                    <input
                        type="text"
                        placeholder="Enter your 6-digit pincode"
                        className="input-field black-placeholder"
                        style={{ color: '#000000', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 16px', fontSize: '0.95rem', fontWeight: 500 }}
                        value={orderDetails.pincode}
                        onChange={(e) => setOrderDetails(prev => ({ ...prev, pincode: e.target.value }))}
                        pattern="[0-9]{6}"
                        maxLength="6"
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Phone Number *</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            className="input-field"
                            style={{ 
                                color: '#2d1e12', 
                                background: '#f5f5f5', 
                                border: '1px solid #ddd', 
                                padding: '12px 8px', 
                                width: '100px', 
                                flexShrink: 0,
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                backgroundSize: '16px',
                                paddingRight: '32px'
                            }}
                            value={orderDetails.countryCode}
                            onChange={(e) => setOrderDetails(prev => ({ ...prev, countryCode: e.target.value }))}
                        >
                            <option value="+91">+91 (IN)</option>
                            <option value="+1">+1 (US)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+971">+971 (UAE)</option>
                            <option value="+61">+61 (AU)</option>
                        </select>
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            className="input-field light-input black-placeholder"
                            style={{ color: '#000000', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 16px', flexGrow: 1, fontSize: '0.95rem', fontWeight: 500 }}
                            value={orderDetails.phone}
                            onChange={(e) => setOrderDetails(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                            pattern="[0-9]{10}"
                            maxLength="10"
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Preferred Delivery Date *</label>
                    <input
                        type="date"
                        className="input-field light-input"
                        style={{ color: '#000000', colorScheme: 'light', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 16px', fontSize: '0.95rem', fontWeight: 500 }}
                        min={new Date().toISOString().split('T')[0]}
                        value={orderDetails.deliveryDate}
                        onChange={(e) => setOrderDetails(prev => ({ ...prev, deliveryDate: e.target.value }))}
                        required
                    />
                </div>

                {/* Payment Method */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Payment Method *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setOrderDetails(prev => ({ ...prev, paymentCategory: 'cod', paymentMethod: 'cod' }))}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '14px', borderRadius: '12px', cursor: 'pointer',
                                border: orderDetails.paymentCategory === 'cod' ? '2px solid #c27835' : '1.5px solid #ddd',
                                background: orderDetails.paymentCategory === 'cod' ? 'rgba(194, 120, 53, 0.1)' : '#ffffff',
                                fontWeight: 700, fontSize: '0.95rem', color: '#2d1e12',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '1.4rem' }}>💵</span>
                            Cash on Delivery
                            {orderDetails.paymentCategory === 'cod' && <span style={{ marginLeft: 'auto', color: '#c27835' }}>✓</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrderDetails(prev => ({ ...prev, paymentCategory: 'online', paymentMethod: '' }))}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '14px', borderRadius: '12px', cursor: 'pointer',
                                border: orderDetails.paymentCategory === 'online' ? '2px solid #c27835' : '1.5px solid #ddd',
                                background: orderDetails.paymentCategory === 'online' ? 'rgba(194, 120, 53, 0.1)' : '#ffffff',
                                fontWeight: 700, fontSize: '0.95rem', color: '#2d1e12',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '1.4rem' }}>💳</span>
                            Online Payment
                            {orderDetails.paymentCategory === 'online' && <span style={{ marginLeft: 'auto', color: '#c27835' }}>✓</span>}
                        </button>
                    </div>

                    {orderDetails.paymentCategory === 'online' && (
                        <div style={{
                            marginTop: '5px',
                            padding: '16px',
                            background: '#f9f9f9',
                            borderRadius: '12px',
                            border: '1px dashed #c27835',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            animation: 'fadeIn 0.3s ease'
                        }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666', margin: 0 }}>Select Online Method:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                                    { id: 'gpay', label: 'Google Pay', icon: '🔵' },
                                    { id: 'paytm', label: 'Paytm', icon: '🔷' },
                                    { id: 'upi', label: 'UPI', icon: '🆔' },
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setOrderDetails(prev => ({ ...prev, paymentMethod: method.id }))}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                                            border: orderDetails.paymentMethod === method.id ? '2px solid #c27835' : '1px solid #ddd',
                                            background: orderDetails.paymentMethod === method.id ? 'rgba(194, 120, 53, 0.1)' : '#ffffff',
                                            fontWeight: 600, fontSize: '0.88rem', color: '#2d1e12',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>{method.icon}</span>
                                        {method.label}
                                        {orderDetails.paymentMethod === method.id && <span style={{ marginLeft: 'auto', color: '#c27835' }}>✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ background: 'rgba(194, 120, 53, 0.1)', borderRadius: '10px', padding: '14px 16px', marginTop: '0.5rem' }}>
                    <p style={{ fontWeight: 700, color: '#2d1e12', margin: '0 0 6px', fontSize: '0.95rem' }}>Order Summary</p>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.88rem', padding: '2px 0' }}>
                            <span>{item.name} × {item.qty}</span>
                            <span>₹{(Number(item.price) * item.qty).toFixed(0)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid rgba(194,120,53,0.2)', marginTop: '8px', paddingTop: '8px', color: '#c27835' }}>
                        <span style={{ color: '#2d1e12' }}>Total</span>
                        <span>₹{cartTotal.toFixed(0)}</span>
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full" style={{ fontSize: '1rem', padding: '14px', marginTop: '0.5rem' }}>
                    Confirm Order ✓
                </button>
            </form>
        </motion.div>
    );
};

export default OrderAddress;
