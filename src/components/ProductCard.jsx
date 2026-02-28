import { Image as ImageIcon } from 'lucide-react';

export default function ProductCard({ product, cartQuantity, onAddToCart, onViewProduct }) {
    return (
        <div 
            className="product-item glass-container" 
            style={{ flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}
        >
            <div 
                className="product-img-wrapper" 
                style={{ width: '100%', height: '200px', cursor: 'pointer' }}
                onClick={() => onViewProduct && onViewProduct(product)}
            >
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
                <h3 className="product-name" style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                    {product.name}
                </h3>
                <p className="product-price price-amount" style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
                    ₹{product.price}
                </p>
                <button 
                    className="btn-primary btn-add-to-cart w-full" 
                    onClick={() => onAddToCart(product)}
                >
                    {cartQuantity > 0 ? `In Cart (${cartQuantity})` : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}
