import React from 'react';
import { motion } from 'framer-motion';
import { EyeOff, Eye } from 'lucide-react';

const CustomerLogin = ({
    handleCustomerLogin,
    error,
    setForgotFrom,
    setView
}) => {

    const [formData, setFormData] = React.useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = React.useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e) => handleCustomerLogin(e, formData);

    return (
        <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="customer-reg-container"
            style={{ maxWidth: '400px' }}
        >
            <h1 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Login</h1>
            <form onSubmit={onSubmit} className="auth-form" style={{ gap: '1.5rem' }}>
                {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <div className="input-field-wrapper">
                    <label className="label-text">Email Address</label>
                    <input type="email" name="email" className="customer-input" placeholder="enter email" required onChange={handleInputChange} />
                </div>
                <div className="input-field-wrapper">
                    <label className="label-text">Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="customer-input"
                            placeholder="password"
                            required
                            onChange={handleInputChange}
                            style={{ width: '100%', paddingRight: '45px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                    <button type="button" onClick={() => { setForgotFrom('customer-login'); setView('forgot'); }} className="link-text" style={{ fontSize: '0.85rem' }}>Forgot Password?</button>
                </div>
                <button type="submit" className="btn-primary" style={{ fontSize: '1rem', padding: '14px' }}>Sign In</button>
                <button type="button" onClick={() => setView('register')} className="link-text mt-4" style={{ color: '#888' }}>Need an account? Register</button>
                <button type="button" onClick={() => setView('login')} className="link-text mt-4" style={{ color: '#888' }}>Are you an admin? Admin Login</button>
            </form>
        </motion.div>
    );
};

export default CustomerLogin;
