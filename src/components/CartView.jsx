import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Trash2, ImageIcon } from 'lucide-react';

const CartView = ({
    setView,
    cartCount,
    cart,
    updateQty,
    removeFromCart,
    cartTotal,
    recommendedProducts,
    addToRecentlyViewed,
    addToCart
}) => {
    return (
        <motion.div
            key="cart"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="cart-view"
            style={{ maxWidth: '680px', margin: '0 auto 2rem' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <button onClick={() => setView('customer-products')} className="bg-none border-none pointer" style={{ color: '#c27835', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <ArrowLeft size={18} /> Back to Products
                </button>
            </div>
            <h2 className="title cart-title-highlight" style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                🛒 Your Cart {cartCount > 0 && <span style={{ fontSize: '1rem', color: '#c27835' }}>({cartCount} items)</span>}
            </h2>

            {cart.length === 0 ? (
                <div className="glass-container" style={{ textAlign: 'center', padding: '3rem' }}>
                    <ShoppingCart size={56} style={{ color: '#c27835', marginBottom: '1rem', opacity: 0.4 }} />
                    <p style={{ color: '#888', fontSize: '1.1rem' }}>Your cart is empty</p>
                    <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setView('customer-products')}>
                        Browse Products
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cart.map(item => (
                        <div key={item.id} className="glass-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                            <div style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f5eee6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.photo ? (
                                    <img src={item.photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                    <ImageIcon size={28} style={{ color: '#c27835' }} />
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{item.name}</p>
                                <p className="price-tag" style={{ margin: '4px 0 0' }}>₹{item.price} each</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={() => updateQty(item.id, -1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #c27835', background: 'white', color: '#c27835', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '24px', textAlign: 'center', color: 'var(--text-primary)' }}>{item.qty}</span>
                                <button onClick={() => updateQty(item.id, 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #c27835', background: '#c27835', color: 'white', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '70px' }}>
                                <p className="price-tag" style={{ margin: 0 }}>₹{(Number(item.price) * item.qty).toFixed(0)}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="delete-btn"><Trash2 size={16} /></button>
                        </div>
                    ))}

                    {/* Order Total */}
                    <div className="glass-container" style={{ padding: '20px 24px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
                            <span>Total</span>
                            <span className="total-highlight">₹{cartTotal.toFixed(0)}</span>
                        </div>
                        <button className="btn-primary w-full" style={{ marginTop: '16px', background: '#c27835', fontSize: '1rem', padding: '14px' }} onClick={() => setView('order-address')}>
                            Place Order
                        </button>
                    </div>
                </div>
            )}

            {/* Recommendations Section */}
            {recommendedProducts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginTop: '3rem' }}
                >
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ✨ You May Also Like
                    </h3>

                    <div className="recommendations-scroll" style={{
                        display: 'flex',
                        gap: '1rem',
                        overflowX: 'auto',
                        paddingBottom: '1rem',
                        scrollBehavior: 'smooth'
                    }}>
                        {recommendedProducts.map(product => (
                            <motion.div
                                key={product.id}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="recommendation-card glass-container"
                                style={{
                                    minWidth: '200px',
                                    maxWidth: '200px',
                                    padding: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                    cursor: 'pointer'
                                }}
                                onClick={() => addToRecentlyViewed(product)}
                            >
                                <div style={{
                                    width: '100%',
                                    height: '140px',
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
                                        <ImageIcon size={40} style={{ color: '#c27835' }} />
                                    )}
                                </div>
                                <div>
                                    <h4 style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)',
                                        margin: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {product.name}
                                    </h4>
                                    <p className="price-tag" style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        margin: '0.25rem 0'
                                    }}>
                                        ₹{product.price}
                                    </p>
                                </div>
                                <button
                                    className="btn-primary"
                                    style={{
                                        fontSize: '0.85rem',
                                        padding: '0.6rem 1rem',
                                        width: '100%'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product);
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CartView;
