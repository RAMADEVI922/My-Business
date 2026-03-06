import React from 'react';
import { motion } from 'framer-motion';
import { Search, ImageIcon } from 'lucide-react';

const CustomerProducts = ({
    searchQuery,
    setSearchQuery,
    filteredProducts,
    cart,
    addToCart,
    addToRecentlyViewed,
    recommendedProducts,
    recentlyViewed
}) => {
    return (
        <motion.div
            key="cust-products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="dashboard-container"
            style={{ marginTop: '5rem' }}
        >
            <h2 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Featured Products</h2>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="search-bar-container"
                style={{
                    marginBottom: '2rem',
                    maxWidth: '600px',
                    margin: '0 auto 2rem'
                }}
            >
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search
                        size={20}
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
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            fontSize: '1rem',
                            border: '2px solid rgba(194, 120, 53, 0.3)',
                            borderRadius: '50px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(194, 120, 53, 0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#c27835',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#c27835';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(194, 120, 53, 0.2)';
                                e.currentTarget.style.color = '#c27835';
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p style={{
                        marginTop: '0.75rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'center'
                    }}>
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                    </p>
                )}
            </motion.div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.id} className="product-item glass-container" style={{ flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                            <div className="product-img-wrapper" style={{ width: '100%', height: '200px' }}>
                                {product.photo ? (
                                    <img
                                        src={product.photo}
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <ImageIcon size={48} className="text-secondary" />
                                )}
                            </div>
                            <div style={{ width: '100%' }}>
                                <h3 className="product-name" style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>{product.name}</h3>
                                <p className="product-price price-amount" style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>₹{product.price}</p>
                                <button
                                    className="btn-primary btn-add-to-cart w-full"
                                    onClick={() => {
                                        addToCart(product);
                                        addToRecentlyViewed(product);
                                    }}
                                >
                                    {cart.find(i => i.id === product.id) ? `In Cart (${cart.find(i => i.id === product.id).qty})` : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'var(--text-secondary)'
                    }}>
                        <Search size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No products found</p>
                        <p style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>Try searching with different keywords</p>
                    </div>
                )}
            </div>

            {/* Recommendations Section on Products Page */}
            {recommendedProducts.length > 0 && recentlyViewed.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ marginTop: '4rem' }}
                >
                    <h3 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}>
                        ✨ Recommended For You
                    </h3>

                    <div className="recommendations-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {recommendedProducts.map(product => (
                            <motion.div
                                key={product.id}
                                whileHover={{ scale: 1.03, y: -8 }}
                                className="recommendation-card glass-container"
                                style={{
                                    padding: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    cursor: 'pointer'
                                }}
                                onClick={() => addToRecentlyViewed(product)}
                            >
                                <div style={{
                                    width: '100%',
                                    height: '160px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    background: '#f5eee6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {product.photo ? (
                                        <img
                                            src={product.photo}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <ImageIcon size={48} style={{ color: '#c27835' }} />
                                    )}
                                </div>
                                <div>
                                    <h4 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        margin: 0
                                    }}>
                                        {product.name}
                                    </h4>
                                    <p className="price-amount" style={{
                                        fontSize: '1.3rem',
                                        fontWeight: 700,
                                        margin: '0.5rem 0'
                                    }}>
                                        ₹{product.price}
                                    </p>
                                </div>
                                <button
                                    className="btn-primary"
                                    style={{
                                        fontSize: '0.9rem',
                                        padding: '0.7rem 1.2rem',
                                        width: '100%'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product);
                                    }}
                                >
                                    {cart.find(i => i.id === product.id) ? `In Cart (${cart.find(i => i.id === product.id).qty})` : 'Add to Cart'}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CustomerProducts;
