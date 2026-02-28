import { ShoppingCart, LogOut } from 'lucide-react';

export default function Navbar({ currentUser, cartCount, onNavigate, onLogout }) {
    if (!currentUser) {
        return (
            <nav className="main-nav">
                <div className="nav-logo pointer" onClick={() => onNavigate('landing')}>
                    <ShoppingCart className="text-accent" size={24} />
                    <span>MyBusiness</span>
                </div>
                <div className="nav-links">
                    <button onClick={() => onNavigate('contact-us')} className="nav-link bg-none border-none pointer">
                        Contact Us
                    </button>
                    <button onClick={() => onNavigate('customer-login')} className="nav-link bg-none border-none pointer">
                        Login
                    </button>
                </div>
            </nav>
        );
    }

    return (
        <nav className="main-nav">
            <div className="nav-logo pointer" onClick={() => onNavigate('customer-products')}>
                <ShoppingCart className="text-accent" size={24} />
                <span>MyBusiness</span>
            </div>
            <div className="nav-links">
                <button onClick={() => onNavigate('customer-products')} className="nav-link bg-none border-none pointer">
                    Home
                </button>
                <button onClick={() => onNavigate('my-orders')} className="nav-link bg-none border-none pointer">
                    My Orders
                </button>
                <button onClick={() => onNavigate('contact-us')} className="nav-link bg-none border-none pointer">
                    Contact Us
                </button>
                <button 
                    onClick={() => onNavigate('cart')} 
                    className={`nav-cart-btn flex-center pointer bg-none border-none ${cartCount > 0 ? 'has-items' : ''}`}
                >
                    <ShoppingCart size={20} />
                    <span className="text-xs">Cart</span>
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
                <button 
                    onClick={onLogout} 
                    className="nav-link bg-none border-none pointer" 
                    style={{ color: '#dc2626' }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
