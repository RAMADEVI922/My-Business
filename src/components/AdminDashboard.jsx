import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, ShoppingCart, User, ChevronRight, ImageIcon, 
    Trash2, IndianRupee, Upload 
} from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import DeliveryCalendar from './DeliveryCalendar';

const AdminDashboard = ({
    setView,
    products,
    orders,
    setOrders,
    adminId,
    onLogout,
    getOrders,
    updateOrderStatus,
    proposeNewDeliveryDate
}) => {
    const navigate = useNavigate();

    const [showRescheduleModal, setShowRescheduleModal] = React.useState(false);
    const [rescheduleOrder, setRescheduleOrder] = React.useState(null);
    const [proposedDate, setProposedDate] = React.useState('');
    const [rescheduleReason, setRescheduleReason] = React.useState('');
    const [newProduct, setNewProduct] = React.useState({ name: '', price: '', photo: '' });
    const [productPhotoFile, setProductPhotoFile] = React.useState(null);
    const [productPhotoPreview, setProductPhotoPreview] = React.useState('');
    const [isUploadingProduct, setIsUploadingProduct] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [selectedDeliveryDate, setSelectedDeliveryDate] = React.useState(null);

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (newProduct.name && newProduct.price) {
            setIsUploadingProduct(true);
            const id = `P${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            let photoUrl = '';
            if (productPhotoFile) {
                const { uploadToS3 } = await import('../aws-config.js');
                photoUrl = await uploadToS3(productPhotoFile, 'product-images');
            }
            const productToAdd = { ...newProduct, id, photo: photoUrl || '' };
            const { saveProduct } = await import('../aws-config.js');
            const success = await saveProduct(productToAdd, adminId);
            if (success) {
                alert('Product added successfully. Refresh the page to see changes.');
                setNewProduct({ name: '', price: '', photo: '' });
                setProductPhotoFile(null);
                setProductPhotoPreview('');
            }
            setIsUploadingProduct(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if(window.confirm('Delete this product?')) {
            const { removeProduct } = await import('../aws-config.js');
            await removeProduct(id);
            alert('Product deleted successfully. Refresh the page to see changes.');
        }
    };


    return (
        <motion.div
            key="admin-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="dashboard-container"
        >
            <AdminNavbar onLogout={onLogout} />

            <Routes>
                <Route path="/admin" element={
                    <>
                        {/* Dashboard Overview */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
                                Dashboard Overview
                            </h2>

                            {/* Summary Cards */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                                gap: '1.5rem',
                                marginBottom: '3rem'
                            }}>
                                {/* Total Products Card */}
                                <motion.div
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    className="glass-container"
                                    style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(135deg, rgba(194, 120, 53, 0.1), rgba(194, 120, 53, 0.05))',
                                        border: '1.5px solid rgba(194, 120, 53, 0.3)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate('/admin/products')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #c27835, #d97706)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 15px rgba(194, 120, 53, 0.3)'
                                        }}>
                                            <Package size={24} color="white" />
                                        </div>
                                        <ChevronRight size={20} color="var(--accent-color)" />
                                    </div>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                                        {products.length}
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                                        Total Products
                                    </p>
                                </motion.div>

                                {/* Total Orders Card */}
                                <motion.div
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    className="glass-container"
                                    style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
                                        border: '1.5px solid rgba(59, 130, 246, 0.3)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate('/admin/orders')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                                        }}>
                                            <ShoppingCart size={24} color="white" />
                                        </div>
                                        <ChevronRight size={20} color="#3b82f6" />
                                    </div>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                                        {orders.length}
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                                        Total Orders
                                    </p>
                                    {orders.filter(o => o.status === 'pending').length > 0 && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            padding: '0.25rem 0.75rem',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            color: '#ef4444',
                                            fontWeight: 600,
                                            display: 'inline-block'
                                        }}>
                                            {orders.filter(o => o.status === 'pending').length} Pending
                                        </div>
                                    )}
                                </motion.div>

                                {/* Total Customers Card */}
                                <motion.div
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    className="glass-container"
                                    style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))',
                                        border: '1.5px solid rgba(168, 85, 247, 0.3)',
                                        cursor: 'default'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
                                        }}>
                                            <User size={24} color="white" />
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                                        {new Set(orders.map(o => o.customerEmail)).size}
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                                        Total Customers
                                    </p>
                                </motion.div>
                            </div>

                            {/* Recent Orders Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-container"
                                style={{ padding: '2rem', marginBottom: '2rem' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                        Recent Orders
                                    </h3>
                                    <button
                                        onClick={() => navigate('/admin/orders')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent-color)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        View All <ChevronRight size={16} />
                                    </button>
                                </div>
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.orderId} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '12px',
                                        marginBottom: '0.75rem',
                                        border: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{order.orderId}</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                                                {order.customerEmail}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 700, color: 'var(--accent-color)', margin: 0 }}>₹{order.total}</p>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                background: order.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                color: order.status === 'pending' ? '#ef4444' : '#10b981',
                                                fontWeight: 600,
                                                display: 'inline-block',
                                                marginTop: '0.25rem'
                                            }}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </>
                } />

                <Route path="/admin/products" element={
                    <section className="dashboard-section glass-container">
                        <div className="section-header">
                            <Package className="text-accent" size={20} />
                            <h3>Product Availability</h3>
                        </div>
                        <div className="product-list">
                            {products.map(product => (
                                <div key={product.id} className="product-item" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', marginBottom: '8px' }}>
                                    <div style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {product.photo ? (
                                            <img
                                                src={product.photo}
                                                alt={product.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <ImageIcon size={28} className="text-secondary" />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className="product-name" style={{ margin: 0, fontSize: '1rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>ID: {product.id}</p>
                                        <p className="product-price" style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--accent-color)' }}>₹{product.price}</p>
                                    </div>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn" style={{ flexShrink: 0 }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                } />

                <Route path="/admin/orders" element={
                    <section className="dashboard-section glass-container">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package className="text-accent" size={20} />
                                <h3>Orders {orders.filter(o => o.status === 'pending').length > 0 && <span style={{ background: '#c27835', color: 'white', borderRadius: '12px', padding: '2px 10px', fontSize: '0.8rem', marginLeft: '8px' }}>{orders.filter(o => o.status === 'pending').length} pending</span>}</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '10px', border: '1px solid rgba(194, 120, 53, 0.3)' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter by Date:</span>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-none border-none"
                                        style={{
                                            color: 'var(--text-primary)',
                                            colorScheme: 'dark',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    {selectedDate && (
                                        <button
                                            onClick={() => setSelectedDate('')}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <button onClick={async () => { const o = await getOrders(); setOrders(o); }} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>↻ Refresh</button>
                            </div>
                        </div>
                        {orders.filter(order => !selectedDate || order.createdAt.startsWith(selectedDate)).length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1.5rem' }}>
                                {selectedDate ? `No orders found for ${selectedDate}.` : 'No orders yet.'}
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {orders
                                    .filter(order => !selectedDate || order.createdAt.startsWith(selectedDate))
                                    .map(order => (
                                        <div key={order.orderId} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px 16px', border: `1px solid ${order.status === 'pending' ? 'rgba(194,120,53,0.4)' : order.status === 'accepted' ? 'rgba(34,197,94,0.3)' : order.status === 'Cancelled by Customer' ? 'rgba(107, 114, 128, 0.4)' : 'rgba(239,68,68,0.3)'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                                <div>
                                                    <p className="order-id-highlight" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{order.orderId}</p>
                                                    <p style={{ margin: '2px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From: {order.customerEmail} | Phone: {order.phone} | Deliver by: {order.deliveryDate}</p>
                                                    <p style={{ margin: '2px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Address: {order.address}</p>
                                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{order.items?.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
                                                    <p className="price-amount" style={{ margin: '4px 0 0', fontSize: '1.1rem' }}>Total: ₹{order.total}</p>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: order.status === 'pending' ? 'rgba(194,120,53,0.2)' : order.status === 'accepted' ? 'rgba(34,197,94,0.2)' : order.status === 'Cancelled by Customer' ? 'rgba(107, 114, 128, 0.2)' : 'rgba(239,68,68,0.2)', color: order.status === 'pending' ? '#c27835' : order.status === 'accepted' ? '#16a34a' : order.status === 'Cancelled by Customer' ? '#6b7280' : '#dc2626' }}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                    {order.status === 'pending' && (
                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                            <button onClick={async () => {
                                                                try {
                                                                    const success = await updateOrderStatus(order.orderId, 'accepted');
                                                                    if (success) {
                                                                        const o = await getOrders(); 
                                                                        setOrders(o);
                                                                        alert('Order accepted successfully!');
                                                                    } else {
                                                                        alert('Failed to accept order. Please try again.');
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Error accepting order:', error);
                                                                    alert('Error accepting order: ' + error.message);
                                                                }
                                                            }} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>✓ Accept</button>
                                                            <button onClick={() => {
                                                                setRescheduleOrder(order);
                                                                setProposedDate('');
                                                                setRescheduleReason('');
                                                                setShowRescheduleModal(true);
                                                            }} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>📅 Reschedule</button>
                                                            <button onClick={async () => {
                                                                if (window.confirm('Cancel this order permanently? Consider using Reschedule instead to propose a new date.')) {
                                                                    try {
                                                                        const success = await updateOrderStatus(order.orderId, 'cancelled');
                                                                        if (success) {
                                                                            const o = await getOrders(); 
                                                                            setOrders(o);
                                                                            alert('Order cancelled successfully!');
                                                                        } else {
                                                                            alert('Failed to cancel order. Please try again.');
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Error cancelling order:', error);
                                                                        alert('Error cancelling order: ' + error.message);
                                                                    }
                                                                }
                                                            }} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>✗ Cancel</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}

                        <div style={{ marginTop: '20px' }}>
                            <DeliveryCalendar
                                orders={orders}
                                onDateClick={(date) => setSelectedDeliveryDate(date)}
                            />
                        </div>

                        <AnimatePresence>
                            {selectedDeliveryDate && (() => {
                                const dateOrders = orders.filter(o => o.deliveryDate === selectedDeliveryDate);
                                const confirmedOrders = dateOrders.filter(o => o.status === 'accepted');
                                const cancelledOrders = dateOrders.filter(o => o.status === 'cancelled');
                                const customerCancelledOrders = dateOrders.filter(o => o.status === 'Cancelled by Customer');
                                
                                return (
                                    <div className="modal-overlay" onClick={() => setSelectedDeliveryDate(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="glass-container"
                                            style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', padding: '24px', position: 'relative' }}
                                        >
                                            <button
                                                onClick={() => setSelectedDeliveryDate(null)}
                                                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                                            >✕</button>
                                            <h3 style={{ borderBottom: '2px solid var(--accent-color)', paddingBottom: '10px', marginBottom: '20px' }}>
                                                Orders for {new Date(selectedDeliveryDate).toLocaleDateString()}
                                            </h3>

                                            {dateOrders.length === 0 ? (
                                                <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No orders scheduled for this day.</p>
                                            ) : (
                                                <>
                                                    {/* Confirmed Orders Section */}
                                                    {confirmedOrders.length > 0 && (
                                                        <div style={{ marginBottom: '24px' }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: '8px', 
                                                                marginBottom: '12px',
                                                                padding: '8px 12px',
                                                                background: 'rgba(34, 197, 94, 0.1)',
                                                                borderRadius: '8px',
                                                                borderLeft: '4px solid #22c55e'
                                                            }}>
                                                                <h4 style={{ margin: 0, color: '#22c55e', fontSize: '1rem', fontWeight: 700 }}>
                                                                    ✓ Confirmed Orders ({confirmedOrders.length})
                                                                </h4>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                {confirmedOrders.map((order, index) => (
                                                                    <div key={order.orderId} style={{ background: 'rgba(34, 197, 94, 0.05)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                <span style={{ 
                                                                                    background: '#22c55e', 
                                                                                    color: 'white', 
                                                                                    borderRadius: '50%', 
                                                                                    width: '28px', 
                                                                                    height: '28px', 
                                                                                    display: 'flex', 
                                                                                    alignItems: 'center', 
                                                                                    justifyContent: 'center',
                                                                                    fontWeight: 700,
                                                                                    fontSize: '0.9rem'
                                                                                }}>
                                                                                    {index + 1}
                                                                                </span>
                                                                                <span className="order-id-highlight" style={{ fontSize: '0.9rem' }}>{order.orderId}</span>
                                                                            </div>
                                                                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontWeight: 700 }}>
                                                                                CONFIRMED
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ background: 'rgba(194, 120, 53, 0.1)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid var(--accent-color)' }}>
                                                                            <p style={{ fontWeight: 800, fontSize: '1rem', margin: 0, color: 'var(--accent-color)' }}>{order.customerEmail}</p>
                                                                            <p style={{ fontSize: '0.85rem', color: '#888', margin: '2px 0 0' }}>Phone: {order.phone}</p>
                                                                        </div>
                                                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginBottom: '10px' }}>
                                                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 5px' }}>Products:</p>
                                                                            {order.items?.map((item, idx) => (
                                                                                <p key={idx} style={{ fontSize: '0.85rem', color: '#ccc', margin: '0 0 2px' }}>• {item.name} ×{item.qty}</p>
                                                                            ))}
                                                                        </div>
                                                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                                                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 5px' }}>Delivery Address:</p>
                                                                            <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>{order.address}</p>
                                                                        </div>
                                                                        <p style={{ marginTop: '12px', textAlign: 'right', color: 'var(--accent-color)', fontWeight: 700, fontSize: '1.1rem' }}>Total: ₹{order.total}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Cancelled Orders Section (by Admin) */}
                                                    {cancelledOrders.length > 0 && (
                                                        <div style={{ marginBottom: '24px' }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: '8px', 
                                                                marginBottom: '12px',
                                                                padding: '8px 12px',
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                borderRadius: '8px',
                                                                borderLeft: '4px solid #ef4444'
                                                            }}>
                                                                <h4 style={{ margin: 0, color: '#ef4444', fontSize: '1rem', fontWeight: 700 }}>
                                                                    ✗ Cancelled Orders ({cancelledOrders.length})
                                                                </h4>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                {cancelledOrders.map((order) => (
                                                                    <div key={order.orderId} style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                                            <span className="order-id-highlight" style={{ fontSize: '0.9rem' }}>{order.orderId}</span>
                                                                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 700 }}>
                                                                                CANCELLED
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ background: 'rgba(194, 120, 53, 0.1)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #ef4444' }}>
                                                                            <p style={{ fontWeight: 800, fontSize: '1rem', margin: 0, color: '#ef4444' }}>{order.customerEmail}</p>
                                                                            <p style={{ fontSize: '0.85rem', color: '#888', margin: '2px 0 0' }}>Phone: {order.phone}</p>
                                                                        </div>
                                                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginBottom: '10px' }}>
                                                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 5px' }}>Products:</p>
                                                                            {order.items?.map((item, idx) => (
                                                                                <p key={idx} style={{ fontSize: '0.85rem', color: '#ccc', margin: '0 0 2px' }}>• {item.name} ×{item.qty}</p>
                                                                            ))}
                                                                        </div>
                                                                        <p style={{ marginTop: '12px', textAlign: 'right', color: '#888', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'line-through' }}>Total: ₹{order.total}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Customer Cancelled Orders Section */}
                                                    {customerCancelledOrders.length > 0 && (
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: '8px', 
                                                                marginBottom: '12px',
                                                                padding: '8px 12px',
                                                                background: 'rgba(107, 114, 128, 0.1)',
                                                                borderRadius: '8px',
                                                                borderLeft: '4px solid #6b7280'
                                                            }}>
                                                                <h4 style={{ margin: 0, color: '#6b7280', fontSize: '1rem', fontWeight: 700 }}>
                                                                    ⊘ Customer Cancelled Orders ({customerCancelledOrders.length})
                                                                </h4>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                {customerCancelledOrders.map((order) => (
                                                                    <div key={order.orderId} style={{ background: 'rgba(107, 114, 128, 0.05)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(107, 114, 128, 0.3)' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                                            <span className="order-id-highlight" style={{ fontSize: '0.9rem', opacity: 0.7 }}>{order.orderId}</span>
                                                                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(107, 114, 128, 0.2)', color: '#6b7280', fontWeight: 700 }}>
                                                                                CUSTOMER CANCELLED
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ background: 'rgba(107, 114, 128, 0.1)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #6b7280' }}>
                                                                            <p style={{ fontWeight: 800, fontSize: '1rem', margin: 0, color: '#6b7280' }}>{order.customerEmail}</p>
                                                                            <p style={{ fontSize: '0.85rem', color: '#888', margin: '2px 0 0' }}>Phone: {order.phone}</p>
                                                                        </div>
                                                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginBottom: '10px' }}>
                                                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 5px' }}>Products:</p>
                                                                            {order.items?.map((item, idx) => (
                                                                                <p key={idx} style={{ fontSize: '0.85rem', color: '#ccc', margin: '0 0 2px', opacity: 0.7 }}>• {item.name} ×{item.qty}</p>
                                                                            ))}
                                                                        </div>
                                                                        <p style={{ marginTop: '12px', textAlign: 'right', color: '#888', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'line-through' }}>Total: ₹{order.total}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </motion.div>
                                    </div>
                                );
                            })()}
                        </AnimatePresence>

                        {/* Reschedule Modal */}
                        <AnimatePresence>
                            {showRescheduleModal && rescheduleOrder && (
                                <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="glass-container"
                                        style={{ width: '100%', maxWidth: '550px', padding: '28px', position: 'relative' }}
                                    >
                                        <button
                                            onClick={() => setShowRescheduleModal(false)}
                                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                                        >✕</button>
                                        
                                        <h3 style={{ borderBottom: '2px solid #f59e0b', paddingBottom: '12px', marginBottom: '20px', color: '#f59e0b' }}>
                                            📅 Propose New Delivery Date
                                        </h3>

                                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', padding: '16px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Order ID:</strong> {rescheduleOrder.orderId}</p>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Customer:</strong> {rescheduleOrder.customerEmail}</p>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Current Delivery Date:</strong> {new Date(rescheduleOrder.deliveryDate).toLocaleDateString()}</p>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Total:</strong> ₹{rescheduleOrder.total}</p>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                                Reason for Rescheduling <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <select
                                                value={rescheduleReason}
                                                onChange={(e) => setRescheduleReason(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    background: '#1a1a1a',
                                                    color: '#ffffff',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="" style={{ background: '#1a1a1a', color: '#888' }}>Select a reason...</option>
                                                <option value="Product unavailable" style={{ background: '#1a1a1a', color: '#ffffff' }}>Product unavailable</option>
                                                <option value="Insufficient stock" style={{ background: '#1a1a1a', color: '#ffffff' }}>Insufficient stock</option>
                                                <option value="Delivery capacity full" style={{ background: '#1a1a1a', color: '#ffffff' }}>Delivery capacity full</option>
                                                <option value="Weather conditions" style={{ background: '#1a1a1a', color: '#ffffff' }}>Weather conditions</option>
                                                <option value="Other operational reasons" style={{ background: '#1a1a1a', color: '#ffffff' }}>Other operational reasons</option>
                                            </select>
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                                Proposed New Delivery Date <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={proposedDate}
                                                onChange={(e) => setProposedDate(e.target.value)}
                                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    background: '#1a1a1a',
                                                    color: '#ffffff',
                                                    fontSize: '0.9rem',
                                                    colorScheme: 'dark'
                                                }}
                                            />
                                            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '6px' }}>
                                                Customer will receive an email to accept or reject this new date
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => setShowRescheduleModal(false)}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!proposedDate || !rescheduleReason) {
                                                        alert('Please fill in all required fields');
                                                        return;
                                                    }
                                                    
                                                    try {
                                                        const success = await proposeNewDeliveryDate(rescheduleOrder.orderId, proposedDate, rescheduleReason);
                                                        if (success) {
                                                            alert('Reschedule proposal saved! (Email notification disabled - configure AWS SES to enable)');
                                                            setShowRescheduleModal(false);
                                                            const o = await getOrders();
                                                            setOrders(o);
                                                        } else {
                                                            alert('Failed to send reschedule proposal');
                                                        }
                                                    } catch (error) {
                                                        console.error('Error sending reschedule proposal:', error);
                                                        alert('Error: ' + error.message);
                                                    }
                                                }}
                                                disabled={!proposedDate || !rescheduleReason}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: (!proposedDate || !rescheduleReason) ? '#666' : '#f59e0b',
                                                    color: 'white',
                                                    cursor: (!proposedDate || !rescheduleReason) ? 'not-allowed' : 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                📅 Send Proposal
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </section>
                } />

                <Route path="/admin/add-product" element={
                    <section className="dashboard-section glass-container admin-white-section">
                        <form onSubmit={handleAddProduct} className="dashboard-form">
                            <h3>Add New Product</h3>
                            <input name="name" placeholder="Product Name" className="input-field" required value={newProduct.name} onChange={handleProductInputChange} />
                            <div className="input-group">
                                <IndianRupee className="input-icon" size={18} style={{ color: 'var(--accent-color)' }} />
                                <input name="price" placeholder="Price" className="input-field" required value={newProduct.price} onChange={handleProductInputChange} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ImageIcon size={16} /> Product Photo
                                </label>
                                {productPhotoPreview && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(194, 120, 53, 0.3)', background: 'rgba(0,0,0,0.2)' }}
                                    >
                                        <img src={productPhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </motion.div>
                                )}
                                <input
                                    type="file"
                                    id="productPhotoInput"
                                    accept="image/*"
                                    className="hidden-input"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setProductPhotoFile(file);
                                            setProductPhotoPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                <label htmlFor="productPhotoInput" className="file-label-btn">
                                    <Upload size={18} />
                                    {productPhotoFile ? (
                                        <span style={{ color: 'var(--accent-color)' }}>{productPhotoFile.name.length > 25 ? productPhotoFile.name.substring(0, 22) + '...' : productPhotoFile.name}</span>
                                    ) : 'Choose Product Image'}
                                </label>
                            </div>
                            <button type="submit" className="btn-primary w-full" disabled={isUploadingProduct}>
                                {isUploadingProduct ? 'Uploading...' : 'Add Product'}
                            </button>
                        </form>
                    </section>
                } />

                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </motion.div>
    );
};

export default AdminDashboard;
