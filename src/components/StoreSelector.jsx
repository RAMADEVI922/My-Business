import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, ChevronDown, ShoppingBag, Sparkles } from 'lucide-react';

/**
 * Store Selector Component
 * 
 * Allows customers to select which admin store they want to shop from
 * Fetches all admin profiles and displays them in a dropdown
 * Shows store information and product preview when a store is selected
 */
const StoreSelector = ({ setView }) => {
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [selectedAdminData, setSelectedAdminData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const { getAdminProfiles } = await import('../aws-config');
            const adminList = await getAdminProfiles();
            setAdmins(adminList || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching admins:', err);
            setError('Failed to load stores');
            setLoading(false);
        }
    };

    const handleAdminSelect = async (adminId) => {
        setSelectedAdmin(adminId);
        const admin = admins.find(a => a.clerkUserId === adminId);
        setSelectedAdminData(admin);

        // Fetch products for preview
        try {
            const { getProducts } = await import('../aws-config');
            const adminProducts = await getProducts(adminId);
            setProducts(adminProducts.slice(0, 3)); // Show first 3 products as preview
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const handleShopHere = () => {
        if (selectedAdmin) {
            sessionStorage.setItem('store_admin_id', selectedAdmin);
            setView('customer-products');
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh',
                gap: '1rem'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Store size={48} color="#c27835" />
                </motion.div>
                <p style={{ color: '#c27835', fontSize: '1.1rem', fontWeight: 500 }}>Loading stores...</p>
            </div>
        );
    }

    return (
        <motion.div
            key="store-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ 
                maxWidth: '900px', 
                margin: '0 auto', 
                padding: '2rem',
                minHeight: '100vh'
            }}
        >
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ textAlign: 'center', marginBottom: '3rem' }}
            >
                <motion.div
                    animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                    }}
                    style={{ display: 'inline-block', marginBottom: '1rem' }}
                >
                    <Store size={64} style={{ color: '#c27835' }} />
                </motion.div>
                <h1 style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #c27835, #d97706)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                }}>
                    Select Your Store
                </h1>
                <p style={{ 
                    color: '#888', 
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    <Sparkles size={18} color="#c27835" />
                    Choose a store to start shopping
                    <Sparkles size={18} color="#c27835" />
                </p>
            </motion.div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ 
                        padding: '1rem', 
                        background: 'linear-gradient(135deg, #fee, #fdd)',
                        color: '#c00', 
                        borderRadius: '12px', 
                        marginBottom: '2rem',
                        border: '2px solid #fcc',
                        fontWeight: 600
                    }}
                >
                    {error}
                </motion.div>
            )}

            {/* Store Selector Dropdown */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ marginBottom: '2rem' }}
            >
                <label style={{ 
                    display: 'block', 
                    marginBottom: '0.75rem', 
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#fff'
                }}>
                    Select Store
                </label>
                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedAdmin}
                        onChange={(e) => handleAdminSelect(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            fontSize: '1.1rem',
                            border: '2px solid #c27835',
                            borderRadius: '12px',
                            appearance: 'none',
                            background: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            color: selectedAdmin ? '#333' : '#666',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 12px rgba(194, 120, 53, 0.2)'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#d97706';
                            e.target.style.boxShadow = '0 6px 20px rgba(194, 120, 53, 0.4)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#c27835';
                            e.target.style.boxShadow = '0 4px 12px rgba(194, 120, 53, 0.2)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <option value="" style={{ color: '#999' }}>-- Select a store --</option>
                        {admins.map(admin => (
                            <option key={admin.clerkUserId} value={admin.clerkUserId} style={{ color: '#333', fontWeight: 600 }}>
                                {admin.storeName || admin.username || admin.email}
                            </option>
                        ))}
                    </select>
                    <motion.div
                        animate={{ y: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <ChevronDown 
                            size={24} 
                            style={{ 
                                position: 'absolute', 
                                right: '1.25rem', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                color: '#c27835'
                            }} 
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Store Information Card */}
            {selectedAdminData && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    style={{
                        padding: '2rem',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        marginBottom: '2rem',
                        border: '2px solid rgba(194, 120, 53, 0.2)'
                    }}
                >
                    <h3 style={{ 
                        marginBottom: '1.5rem', 
                        color: '#c27835',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Store size={24} />
                        Store Information
                    </h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ 
                            fontSize: '1.1rem',
                            marginBottom: '0.5rem',
                            color: '#555'
                        }}>
                            <strong style={{ color: '#333' }}>Store Name:</strong> {selectedAdminData.storeName || 'N/A'}
                        </p>
                        <p style={{ 
                            fontSize: '1.1rem',
                            color: '#555'
                        }}>
                            <strong style={{ color: '#333' }}>Email:</strong> {selectedAdminData.email}
                        </p>
                    </div>
                    
                    {products.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ marginTop: '2rem' }}
                        >
                            <h4 style={{ 
                                marginBottom: '1.5rem',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: '#333'
                            }}>
                                Product Preview
                            </h4>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                                gap: '1.5rem' 
                            }}>
                                {products.map((product, index) => (
                                    <motion.div 
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ 
                                            scale: 1.05,
                                            boxShadow: '0 8px 16px rgba(194, 120, 53, 0.2)'
                                        }}
                                        style={{
                                            padding: '1rem',
                                            border: '2px solid #f0f0f0',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            background: 'white',
                                            transition: 'all 0.3s',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {product.photo && (
                                            <img 
                                                src={product.photo} 
                                                alt={product.name}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '120px', 
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    marginBottom: '0.75rem'
                                                }}
                                            />
                                        )}
                                        <p style={{ 
                                            fontSize: '1rem', 
                                            fontWeight: 700,
                                            color: '#333',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {product.name}
                                        </p>
                                        <p style={{ 
                                            color: '#c27835', 
                                            fontSize: '1.1rem',
                                            fontWeight: 700
                                        }}>
                                            ₹{product.price}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Shop Now Button */}
            <motion.button
                onClick={handleShopHere}
                disabled={!selectedAdmin}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={selectedAdmin ? { 
                    scale: 1.03, 
                    y: -4,
                    boxShadow: '0 12px 32px rgba(194, 120, 53, 0.5)'
                } : {}}
                whileTap={selectedAdmin ? { scale: 0.97 } : {}}
                style={{
                    width: '100%',
                    padding: '1.75rem',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    background: selectedAdmin 
                        ? 'linear-gradient(135deg, #c27835 0%, #d97706 50%, #ea580c 100%)' 
                        : 'linear-gradient(135deg, #999, #888)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: selectedAdmin ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    transition: 'all 0.3s',
                    boxShadow: selectedAdmin 
                        ? '0 8px 24px rgba(194, 120, 53, 0.4)' 
                        : '0 4px 12px rgba(0,0,0,0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {selectedAdmin && (
                    <motion.div
                        animate={{
                            x: ['-100%', '100%']
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            pointerEvents: 'none'
                        }}
                    />
                )}
                <ShoppingBag size={28} />
                <span>Shop Now</span>
            </motion.button>
        </motion.div>
    );
};

export default StoreSelector;
