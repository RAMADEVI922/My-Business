import { NavLink } from 'react-router-dom';
import { ShoppingCart, LogOut, Package, ListOrdered, Plus, LayoutDashboard } from 'lucide-react';

const AdminNavbar = ({ onLogout }) => {
    return (
        <nav className="admin-nav">
            <div className="nav-logo">
                <ShoppingCart />
                <span>Admin Panel</span>
            </div>
            <div className="nav-links">
                <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
                    <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''}>
                    <Package size={18} /> Products
                </NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
                    <ListOrdered size={18} /> Orders
                </NavLink>
                <NavLink to="/admin/add-product" className={({ isActive }) => isActive ? 'active' : ''}>
                    <Plus size={18} /> Add Product
                </NavLink>
            </div>
            <button onClick={onLogout} className="logout-btn">
                <LogOut size={18} /> Logout
            </button>
        </nav>
    );
};

export default AdminNavbar;
