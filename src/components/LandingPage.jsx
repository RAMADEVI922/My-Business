import { motion } from 'framer-motion';
import { ShoppingCart, User, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onSelectCustomerType, onAdminAccess }) {
    return (
        <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="landing-container"
        >
            <div className="landing-cards">
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -5, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)", backgroundColor: "rgba(255, 255, 255, 1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="landing-card landing-card-white"
                >
                    <div className="card-icon-box">
                        <ShoppingCart size={32} />
                    </div>
                    <h2 className="card-title">Shop Owners</h2>
                    <p className="card-desc">Register your shop with proper documentation and get access to bulk ordering</p>
                    <div className="card-features">
                        <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Shop photo required</div>
                        <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Shop number/registration</div>
                        <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Shop license document</div>
                    </div>
                    <button onClick={() => onSelectCustomerType('shop-owner')} className="btn-primary">
                        Register as Shop Owner
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -5, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)", backgroundColor: "rgba(255, 255, 255, 1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="landing-card landing-card-white"
                >
                    <div className="card-icon-box">
                        <User size={32} />
                    </div>
                    <h2 className="card-title">Regular Customers</h2>
                    <p className="card-desc">Register with your credentials and documents to start shopping</p>
                    <div className="card-features">
                        <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Phone or email registration</div>
                        <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> ID proof & photo required</div>
                        <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Quick admin approval</div>
                    </div>
                    <button onClick={() => onSelectCustomerType('regular')} className="btn-primary">
                        Register as Customer
                    </button>
                </motion.div>
            </div>
            <motion.button
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
                whileHover={{ scale: 1.05, background: "rgba(194, 120, 53, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onAdminAccess}
                className="admin-access-btn mt-4"
            >
                Admin Access
            </motion.button>
        </motion.div>
    );
}
