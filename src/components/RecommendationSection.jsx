import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

export default function RecommendationSection({ 
    recommendations, 
    cart, 
    onAddToCart, 
    onViewProduct,
    title = "✨ You May Also Like",
    layout = "horizontal" // "horizontal" or "grid"
}) {
    if (recommendations.length === 0) return null;

    const containerStyle = layout === "horizontal" 
        ? {
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            scrollBehavior: 'smooth'
        }
        : {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.5rem'
        };

    const cardStyle = layout === "horizontal"
        ? { minWidth: '200px', maxWidth: '200px' }
        : {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: '3rem' }}
        >
            <h3 style={{ 
                fontSize: layout === "horizontal" ? '1.5rem' : '1.75rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: layout === "grid" ? 'center' : 'flex-start'
            }}>
                {title}
            </h3>
            
            <div className="recommendations-scroll" style={containerStyle}>
                {recommendations.map(product => {
                    const cartItem = cart.find(i => i.id === product.id);
                    
                    return (
                        <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="recommendation-card glass-container"
                            style={{
                                ...cardStyle,
                                padding: layout === "horizontal" ? '1rem' : '1.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => onViewProduct && onViewProduct(product)}
                        >
                            <div style={{ 
                                width: '100%', 
                                height: layout === "horizontal" ? '140px' : '160px', 
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
                                    fontSize: layout === "horizontal" ? '0.95rem' : '1.1rem', 
                                    fontWeight: 600, 
                                    color: 'var(--text-primary)',
                                    margin: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {product.name}
                                </h4>
                                <p className="price-amount" style={{ 
                                    fontSize: layout === "horizontal" ? '1.1rem' : '1.3rem', 
                                    fontWeight: 700,
                                    margin: '0.25rem 0'
                                }}>
                                    ₹{product.price}
                                </p>
                            </div>
                            <button
                                className="btn-primary"
                                style={{ 
                                    fontSize: layout === "horizontal" ? '0.85rem' : '0.9rem', 
                                    padding: layout === "horizontal" ? '0.6rem 1rem' : '0.7rem 1.2rem',
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
