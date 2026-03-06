import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

function RecommendationSection({ products, cart, onAddToCart, onProductClick, title = "✨ Recommended For You" }) {
    if (products.length === 0) return null;

    return (
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
                {title}
            </h3>
            
            <div className="recommendations-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.5rem'
            }}>
                {products.map(product => {
                    const cartItem = cart.find(i => i.id === product.id);
                    return (
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
                            onClick={() => onProductClick && onProductClick(product)}
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
                                    onAddToCart(product);
                                }}
                            >
                                {cartItem ? `In Cart (${cartItem.qty})` : 'Add to Cart'}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

export default RecommendationSection;
