import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ListOrdered } from 'lucide-react';
import SignaturePad from './SignaturePad';

const MyOrders = ({
    setView,
    myOrders,
    setMyOrders,
    currentUser,
    handleCancelOrder,
    getOrdersByEmail,
    acceptProposedDate,
    rejectProposedDate
}) => {
    const [showSignaturePad, setShowSignaturePad] = React.useState(false);
    const [selectedOrderForSignature, setSelectedOrderForSignature] = React.useState(null);

    const handleSignatureSubmit = async (signatureDataUrl) => {
        try {
            const { saveDeliverySignature } = await import('../aws-config.js');
            const result = await saveDeliverySignature(selectedOrderForSignature.orderId, signatureDataUrl);
            
            if (result.success) {
                alert('Delivery confirmed! Thank you for your signature.');
                setShowSignaturePad(false);
                setSelectedOrderForSignature(null);
                // Refresh orders
                const o = await getOrdersByEmail(currentUser?.email || '');
                setMyOrders(o);
            } else {
                alert('Failed to save signature. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting signature:', error);
            alert('Error saving signature: ' + error.message);
        }
    };

    return (
        <motion.div
            key="my-orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-view"
            style={{ maxWidth: '800px', margin: '0 auto 2rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <button onClick={() => setView('customer-products')} className="bg-none border-none pointer" style={{ color: '#c27835', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <ArrowLeft size={18} /> Back to Products
                </button>
                <button onClick={async () => {
                    const o = await getOrdersByEmail(currentUser?.email || '');
                    setMyOrders(o);
                }} style={{ background: 'none', border: 'none', color: '#c27835', cursor: 'pointer', fontWeight: 600 }}>↻ Refresh</button>
            </div>

            <h2 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', borderBottom: '3px solid #c27835', paddingBottom: '10px' }}>My Orders</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myOrders.length === 0 ? (
                    <div className="glass-container" style={{ textAlign: 'center', padding: '3rem' }}>
                        <ListOrdered size={48} style={{ color: '#c27835', marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
                        <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setView('customer-products')}>
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    myOrders.map(order => (
                        <div key={order.orderId} className="glass-container" style={{ padding: '20px', borderLeft: `5px solid ${order.status === 'pending' ? '#f59e0b' : order.status === 'pending-reschedule' ? '#f59e0b' : order.status === 'accepted' ? '#22c55e' : order.status === 'Out for Delivery' ? '#3b82f6' : order.status === 'Delivered' ? '#10b981' : order.status === 'Cancelled by Customer' ? '#6b7280' : '#ef4444'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                        <span className="order-id-highlight" style={{ fontSize: '0.9rem' }}>{order.orderId}</span>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: order.status === 'pending' ? '#fef3c7' : order.status === 'pending-reschedule' ? '#fef3c7' : order.status === 'accepted' ? '#dcfce7' : order.status === 'Out for Delivery' ? '#dbeafe' : order.status === 'Delivered' ? '#d1fae5' : order.status === 'Cancelled by Customer' ? '#f3f4f6' : '#fee2e2',
                                            color: order.status === 'pending' ? '#92400e' : order.status === 'pending-reschedule' ? '#92400e' : order.status === 'accepted' ? '#166534' : order.status === 'Out for Delivery' ? '#1e40af' : order.status === 'Delivered' ? '#065f46' : order.status === 'Cancelled by Customer' ? '#374151' : '#991b1b'
                                        }}>
                                            {order.status === 'pending-reschedule' ? 'RESCHEDULE PROPOSED' : order.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Deliver to: {order.address}</p>
                                    
                                    {/* Reschedule Proposal Notice */}
                                    {order.status === 'pending-reschedule' && order.proposedDeliveryDate && (
                                        <div style={{ 
                                            marginTop: '12px', 
                                            padding: '12px', 
                                            background: 'rgba(245, 158, 11, 0.1)', 
                                            borderRadius: '8px',
                                            border: '1px solid rgba(245, 158, 11, 0.3)'
                                        }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 8px' }}>
                                                📅 New Delivery Date Proposed
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                                                <strong>Reason:</strong> {order.rescheduleReason}
                                            </p>
                                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Original Date</p>
                                                    <p style={{ fontSize: '0.85rem', color: '#dc2626', margin: '2px 0', textDecoration: 'line-through' }}>
                                                        {new Date(order.deliveryDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span style={{ fontSize: '1.2rem', color: '#888' }}>→</span>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>New Date</p>
                                                    <p style={{ fontSize: '0.85rem', color: '#16a34a', margin: '2px 0', fontWeight: 700 }}>
                                                        {new Date(order.proposedDeliveryDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Signature Display */}
                                    {order.status === 'Delivered' && order.deliverySignature && (
                                        <div style={{ 
                                            marginTop: '12px', 
                                            padding: '12px', 
                                            background: 'rgba(16, 185, 129, 0.1)', 
                                            borderRadius: '8px',
                                            border: '1px solid rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', margin: '0 0 8px' }}>
                                                ✓ Delivery Confirmed
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                                                Signed on: {new Date(order.deliverySignedAt).toLocaleString()}
                                            </p>
                                            <div style={{ 
                                                background: 'white', 
                                                borderRadius: '8px', 
                                                padding: '8px',
                                                border: '2px solid #10b981'
                                            }}>
                                                <img 
                                                    src={order.deliverySignature} 
                                                    alt="Delivery Signature" 
                                                    style={{ 
                                                        width: '100%', 
                                                        maxWidth: '300px', 
                                                        height: 'auto',
                                                        display: 'block'
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ marginTop: '12px' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Items:</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                            {order.items?.map(i => `${i.name} (${i.qty})`).join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>Total Amount</p>
                                    <p className="total-highlight" style={{ fontSize: '1.4rem', margin: 0 }}>₹{order.total}</p>
                                    
                                    {/* Sign for Delivery Button */}
                                    {order.status === 'Out for Delivery' && (
                                        <button
                                            onClick={() => {
                                                setSelectedOrderForSignature(order);
                                                setShowSignaturePad(true);
                                            }}
                                            style={{
                                                marginTop: '12px',
                                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                                border: 'none',
                                                color: 'white',
                                                borderRadius: '8px',
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                            }}
                                        >
                                            ✍️ Sign for Delivery
                                        </button>
                                    )}

                                    {/* Reschedule Response Buttons */}
                                    {order.status === 'pending-reschedule' && (
                                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(`Accept new delivery date: ${new Date(order.proposedDeliveryDate).toLocaleDateString()}?`)) {
                                                        const success = await acceptProposedDate(order.orderId);
                                                        if (success) {
                                                            alert('New delivery date confirmed!');
                                                            const o = await getOrdersByEmail(currentUser?.email || '');
                                                            setMyOrders(o);
                                                        } else {
                                                            alert('Failed to accept new date');
                                                        }
                                                    }
                                                }}
                                                style={{
                                                    background: '#16a34a',
                                                    border: 'none',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                ✓ Accept New Date
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Reject the proposed date? This will cancel your order.')) {
                                                        const success = await rejectProposedDate(order.orderId);
                                                        if (success) {
                                                            alert('Order cancelled. You can place a new order anytime.');
                                                            const o = await getOrdersByEmail(currentUser?.email || '');
                                                            setMyOrders(o);
                                                        } else {
                                                            alert('Failed to reject proposal');
                                                        }
                                                    }
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: '1.5px solid #dc2626',
                                                    color: '#dc2626',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                ✗ Reject & Cancel
                                            </button>
                                        </div>
                                    )}

                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancelOrder(order)}
                                            style={{
                                                marginTop: '12px',
                                                background: 'none',
                                                border: '1.5px solid #dc2626',
                                                color: '#dc2626',
                                                borderRadius: '8px',
                                                padding: '6px 12px',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                transition: 'all 0.2s',
                                                opacity: 0.8
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#dc2626';
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.opacity = '1';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'none';
                                                e.currentTarget.style.color = '#dc2626';
                                                e.currentTarget.style.opacity = '0.8';
                                            }}
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Signature Pad Modal */}
            {showSignaturePad && selectedOrderForSignature && (
                <SignaturePad
                    orderId={selectedOrderForSignature.orderId}
                    onSave={handleSignatureSubmit}
                    onCancel={() => {
                        setShowSignaturePad(false);
                        setSelectedOrderForSignature(null);
                    }}
                />
            )}
        </motion.div>
    );
};

export default MyOrders;
