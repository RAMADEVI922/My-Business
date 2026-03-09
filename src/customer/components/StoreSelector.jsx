import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, ChevronDown, ShoppingBag, Sparkles, Search, Home } from 'lucide-react';
import { useUser } from '@clerk/react';

/**
 * Store Selector Component
 * 
 * Allows customers to select which admin store they want to shop from
 * Fetches all admin profiles and displays them in a dropdown
 * Shows store information and product preview when a store is selected
 * Includes product search to find which admin sells a specific product
 */
const StoreSelector = ({ setView }) => {
    const { user } = useUser();
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [selectedAdminData, setSelectedAdminData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [highlightedAdmin, setHighlightedAdmin] = useState(null);

    // Guard: Check if shop owner has uploaded documents
    useEffect(() => {
        if (user) {
            const customerType = sessionStorage.getItem('customer_type');
            const documentsUploaded = user.unsafeMetadata?.documentsUploaded;
            
            if (customerType === 'shop-owner' && !documentsUploaded) {
                console.log('Shop owner must upload documents first - redirecting');
                setView('shop-owner-documents');
                return;
            }
        }
    }, [user, setView]);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const { getAdminProfiles } = await import('../../services/aws-config');
            const adminList = await getAdminProfiles();
            setAdmins(adminList || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching admins:', err);
            setError('Failed to load stores');
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        
        if (!query.trim()) {
            setSearchResults([]);
            setHighlightedAdmin(null);
            return;
        }

        try {
            const { getProducts } = await import('../../services/aws-config');
            const results = [];
            
            // Search products from all admins
            for (const admin of admins) {
                const adminProducts = await getProducts(admin.clerkUserId);
                const matchingProducts = adminProducts.filter(product => 
                    product.name.toLowerCase().includes(query.toLowerCase()) ||
                    product.description?.toLowerCase().includes(query.toLowerCase())
                );
                
                if (matchingProducts.length > 0) {
                    results.push({
                        admin,
                        products: matchingProducts
                    });
                }
            }
            
            setSearchResults(results);
            
            // Highlight the first admin if results found
            if (results.length > 0) {
                setHighlightedAdmin(results[0].admin.clerkUserId);
            } else {
                setHighlightedAdmin(null);
            }
        } catch (err) {
            console.error('Error searching products:', err);
        }
    };

    const handleAdminSelect = async (adminId) => {
        setSelectedAdmin(adminId);
        const admin = admins.find(a => a.clerkUserId === adminId);
        setSelectedAdminData(admin);

        // Fetch products for preview
        try {
            const { getProducts } = await import('../../services/aws-config');
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
            {/* Home Button */}
            <motion.button
                onClick={() => setView('welcome')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'absolute',
                    top: '2rem',
                    left: '2rem',
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(194, 120, 53, 0.5)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s',
                    backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(194, 120, 53, 0.3)';
                    e.target.style.borderColor = '#c27835';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderColor = 'rgba(194, 120, 53, 0.5)';
                }}
            >
                <Home size={18} />
                <span>Home</span>
            </motion.button>

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

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{ marginBottom: '2rem' }}
            >
                <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: '#fff'
                }}>
                    Search Products
                </label>
                <div style={{ position: 'relative' }}>
                    <Search 
                        size={18} 
                        style={{ 
                            position: 'absolute', 
                            left: '1rem', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: '#c27835',
                            pointerEvents: 'none'
                        }} 
                    />
                    <input
                        type="text"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.75rem',
                            fontSize: '0.95rem',
                            border: '2px solid #c27835',
                            borderRadius: '8px',
                            background: 'white',
                            fontWeight: 500,
                            color: '#333',
                            transition: 'all 0.3s',
                            boxShadow: '0 2px 8px rgba(194, 120, 53, 0.2)',
                            outline: 'none'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#d97706';
                            e.target.style.boxShadow = '0 4px 14px rgba(194, 120, 53, 0.4)';
                            e.target.style.transform = 'translateY(-1px)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#c27835';
                            e.target.style.boxShadow = '0 2px 8px rgba(194, 120, 53, 0.2)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    />
                </div>
            </motion.div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}
                >
                    <h3 style={{ 
                        color: '#fff', 
                        marginBottom: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: 700
                    }}>
                        Found in {searchResults.length} store{searchResults.length > 1 ? 's' : ''}:
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {searchResults.map(({ admin, products: matchedProducts }) => (
                            <motion.div
                                key={admin.clerkUserId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => {
                                    setSelectedAdmin(admin.clerkUserId);
                                    handleAdminSelect(admin.clerkUserId);
                                    setHighlightedAdmin(admin.clerkUserId);
                                }}
                                style={{
                                    padding: '1rem',
                                    background: highlightedAdmin === admin.clerkUserId 
                                        ? 'linear-gradient(135deg, rgba(194, 120, 53, 0.2), rgba(217, 119, 6, 0.2))'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '10px',
                                    border: highlightedAdmin === admin.clerkUserId 
                                        ? '2px solid #c27835' 
                                        : '2px solid rgba(255, 255, 255, 0.2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div>
                                        <h4 style={{ 
                                            color: '#fff', 
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            marginBottom: '0.25rem'
                                        }}>
                                            {admin.storeName || admin.username}
                                        </h4>
                                        <p style={{ 
                                            color: '#ccc', 
                                            fontSize: '0.85rem' 
                                        }}>
                                            {matchedProducts.length} matching product{matchedProducts.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <Store size={24} color="#c27835" />
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '0.5rem', 
                                    flexWrap: 'wrap' 
                                }}>
                                    {matchedProducts.slice(0, 3).map(product => (
                                        <div
                                            key={product.id}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                background: 'rgba(194, 120, 53, 0.3)',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                color: '#fff',
                                                fontWeight: 600
                                            }}
                                        >
                                            {product.name}
                                        </div>
                                    ))}
                                    {matchedProducts.length > 3 && (
                                        <div style={{
                                            padding: '0.4rem 0.75rem',
                                            background: 'rgba(194, 120, 53, 0.2)',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            color: '#ccc',
                                            fontWeight: 600
                                        }}>
                                            +{matchedProducts.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {searchQuery && searchResults.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        padding: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        textAlign: 'center',
                        marginBottom: '2rem',
                        color: '#ccc'
                    }}
                >
                    No products found matching "{searchQuery}"
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
                    marginBottom: '0.5rem', 
                    fontWeight: 600,
                    fontSize: '0.95rem',
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
                            padding: '0.75rem 1rem',
                            paddingBottom: '2rem',
                            fontSize: '0.95rem',
                            border: '2px solid #c27835',
                            borderRadius: '8px',
                            appearance: 'none',
                            background: highlightedAdmin 
                                ? 'linear-gradient(135deg, #fff9f0, #ffffff)'
                                : 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            color: selectedAdmin ? '#333' : '#666',
                            transition: 'all 0.3s',
                            boxShadow: '0 2px 8px rgba(194, 120, 53, 0.2)'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#d97706';
                            e.target.style.boxShadow = '0 4px 14px rgba(194, 120, 53, 0.4)';
                            e.target.style.transform = 'translateY(-1px)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#c27835';
                            e.target.style.boxShadow = '0 2px 8px rgba(194, 120, 53, 0.2)';
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
                        animate={{ y: [0, 2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: '0.4rem',
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <ChevronDown 
                            size={18} 
                            style={{ 
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
                    scale: 1.02, 
                    y: -2,
                    boxShadow: '0 8px 24px rgba(194, 120, 53, 0.5)'
                } : {}}
                whileTap={selectedAdmin ? { scale: 0.98 } : {}}
                style={{
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    background: selectedAdmin 
                        ? 'linear-gradient(135deg, #c27835 0%, #d97706 50%, #ea580c 100%)' 
                        : 'linear-gradient(135deg, #999, #888)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: selectedAdmin ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    transition: 'all 0.3s',
                    boxShadow: selectedAdmin 
                        ? '0 4px 16px rgba(194, 120, 53, 0.4)' 
                        : '0 2px 8px rgba(0,0,0,0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
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
                <ShoppingBag size={20} />
                <span>Shop Now</span>
            </motion.button>
        </motion.div>
    );
};

export default StoreSelector;
