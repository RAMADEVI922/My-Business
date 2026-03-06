import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, EyeOff, Eye, LogIn } from 'lucide-react';

const AdminLogin = ({
    handleAdminLogin,
    error,
    setForgotFrom,
    setView
}) => {

    const [formData, setFormData] = React.useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = React.useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e) => handleAdminLogin(e, formData);

    return (
        <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="glass-container auth-card"
        >
            <div className="header-section">
                <div className="logo-box">
                    <ShieldCheck size={32} className="logo-icon" color="var(--accent-color)" />
                </div>
                <h1 className="title">Admin Portal</h1>
                <p className="subtitle">Secure access to your dashboard</p>
            </div>

            <form onSubmit={onSubmit} className="auth-form">
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="error-message"
                        style={{ color: '#ff4d4f', textAlign: 'center', fontSize: '14px' }}
                    >
                        {error}
                    </motion.div>
                )}
                <div className="input-group">
                    <User size={18} className="input-icon" />
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        className="input-field"
                        required
                        onChange={handleInputChange}
                    />
                </div>

                <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        className="input-field"
                        required
                        onChange={handleInputChange}
                        style={{ paddingRight: '45px' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="form-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" onClick={() => { setForgotFrom('login'); setView('forgot'); }} className="link-text" style={{ fontSize: '0.85rem' }}>Forgot Password?</button>
                    <button type="button" onClick={() => setView('landing')} className="link-text">Customer Portal</button>
                </div>

                <button type="submit" className="btn-primary w-full flex-center">
                    Sign In <LogIn size={18} />
                </button>
            </form>
        </motion.div>
    );
};

export default AdminLogin;
