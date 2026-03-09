import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, LogOut, Package, ListOrdered, Plus, LayoutDashboard, Menu, X } from 'lucide-react';

const AdminNavbar = ({ onLogout }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="admin-nav">
            <div className="nav-logo">
                <ShoppingCart />
                <span>Admin Panel</span>
            </div>

            {/* Hamburger Menu Button - Mobile Only */}
            <button 
                className="mobile-menu-toggle" 
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                style={{
                    display: 'none',
                    background: 'none',
                    border: 'none',
                    color: '#c27835',
                    cursor: 'pointer',
                    padding: '0.5rem',
                }}
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Navigation Links */}
            <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <NavLink 
                    to="/admin" 
                    end 
                    className={({ isActive }) => isActive ? 'active' : ''}
                    onClick={closeMobileMenu}
                >
                    <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink 
                    to="/admin/products" 
                    className={({ isActive }) => isActive ? 'active' : ''}
                    onClick={closeMobileMenu}
                >
                    <Package size={18} /> Products
                </NavLink>
                <NavLink 
                    to="/admin/orders" 
                    className={({ isActive }) => isActive ? 'active' : ''}
                    onClick={closeMobileMenu}
                >
                    <ListOrdered size={18} /> Orders
                </NavLink>
                <NavLink 
                    to="/admin/add-product" 
                    className={({ isActive }) => isActive ? 'active' : ''}
                    onClick={closeMobileMenu}
                >
                    <Plus size={18} /> Add Product
                </NavLink>
                
                {/* Logout Button - Inside mobile menu */}
                <button 
                    onClick={() => {
                        closeMobileMenu();
                        onLogout();
                    }} 
                    className="logout-btn mobile-logout"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* Logout Button - Desktop Only */}
            <button onClick={onLogout} className="logout-btn desktop-logout">
                <LogOut size={18} /> Logout
            </button>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="mobile-menu-overlay" 
                    onClick={closeMobileMenu}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 998,
                        display: 'none',
                    }}
                />
            )}
        </nav>
    );
};

export default AdminNavbar;
