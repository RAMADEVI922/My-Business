import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, ChevronDown, ShoppingBag } from 'lucide-react';

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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <p>Loading stores...</p>
            </div>
        );
    }

    return (
        <motion.div
            key="store-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Store size={48} style={{ color: '#c27835', margin: '0 auto 1rem' }} />
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Select Your Store</h1>
                <p style={{ color: '#666' }}>Choose a store to start shopping</p>
            </div>

            {error && (
                <div style={{ 
                    padding: '1rem', 
                    background: '#fee', 
                    color: '#c00', 
                    borderRadius: '8px', 
                    marginBottom: '1rem' 
                }}>
                    {error}
                </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Select Store
                </label>
                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedAdmin}
                        onChange={(e) => handleAdminSelect(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            appearance: 'none',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">-- Select a store --</option>
                        {admins.map(admin => (
                            <option key={admin.clerkUserId} value={admin.clerkUserId}>
                                {admin.storeName || admin.username || admin.email}
                            </option>
                        ))}
                    </select>
                    <ChevronDown 
                        size={20} 
                        style={{ 
                            position: 'absolute', 
                            right: '1rem', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none'
                        }} 
                    />
                </div>
            </div>

            {selectedAdminData && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        marginBottom: '2rem'
                    }}
                >
                    <h3 style={{ marginBottom: '1rem', color: '#c27835' }}>Store Information</h3>
                    <p><strong>Store Name:</strong> {selectedAdminData.storeName || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedAdminData.email}</p>
                    
                    {products.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Product Preview</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                {products.map(product => (
                                    <div 
                                        key={product.id}
                                        style={{
                                            padding: '0.75rem',
                                            border: '1px solid #eee',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {product.image && (
                                            <img 
                                                src={product.image} 
                                                alt={product.name}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100px', 
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    marginBottom: '0.5rem'
                                                }}
                                            />
                                        )}
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{product.name}</p>
                                        <p style={{ color: '#c27835', fontSize: '0.9rem' }}>₹{product.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            <button
                onClick={handleShopHere}
                disabled={!selectedAdmin}
                style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: selectedAdmin ? '#c27835' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: selectedAdmin ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s'
                }}
            >
                <ShoppingBag size={20} />
                Shop Here
            </button>
        </motion.div>
    );
};

export default StoreSelector;
