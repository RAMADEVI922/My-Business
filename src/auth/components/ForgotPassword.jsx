import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, ChevronRight, Lock, EyeOff, Eye } from 'lucide-react';

const ForgotPassword = ({
    setView,
    forgotFrom
}) => {

    const [forgotStage, setForgotStage] = React.useState('email');
    const [resetEmail, setResetEmail] = React.useState('');
    const [resetOTP, setResetOTP] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [error, setError] = React.useState('');
    const [resetLoading, setResetLoading] = React.useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setResetLoading(true);
        try {
            const { getAdminByEmail, saveOTP, sendPasswordResetEmail } = await import('../../services/aws-config.js');
            const admin = await getAdminByEmail(resetEmail);
            if (!admin) {
                setError('Email not found. Please enter your registered admin email.');
                setResetLoading(false);
                return;
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const saved = await saveOTP(admin.username, otp);
            if (!saved) {
                setError('Failed to generate reset token. Please try again.');
                setResetLoading(false);
                return;
            }
            const sent = await sendPasswordResetEmail(resetEmail, otp);
            if (!sent) {
                setError('Failed to send reset email. Ensure your SES is configured.');
                setResetLoading(false);
                return;
            }
            setForgotStage('otp');
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    const handleVerifyAndReset = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match.'); return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.'); return;
        }
        setResetLoading(true);
        try {
            const { verifyOTP, getAdminByEmail, updateAdminPassword } = await import('../../services/aws-config.js');
            const verification = await verifyOTP(resetEmail, resetOTP);
            if (!verification.success) {
                setError(verification.message || 'Invalid or expired OTP.');
                setResetLoading(false); return;
            }
            const admin = await getAdminByEmail(resetEmail);
            const updated = await updateAdminPassword(admin.username, newPassword);
            if (!updated) {
                setError('Failed to update password. Please try again.');
                setResetLoading(false); return;
            }
            setForgotStage('success');
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-container auth-card"
            style={{ maxWidth: '400px' }}
        >
            {forgotStage === 'email' && (
                <>
                    <div className="header-section">
                        <div className="logo-box">
                            <Mail size={32} className="logo-icon" color="var(--accent-color)" />
                        </div>
                        <h1 className="title">Reset Password</h1>
                        <p className="subtitle">Enter your email to receive a reset OTP.</p>
                    </div>
                    <form onSubmit={handleSendOTP} className="auth-form">
                        {error && <p className="error-message" style={{ color: '#ff4d4f', textAlign: 'center' }}>{error}</p>}
                        <div className="input-group">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="Admin Email"
                                className="input-field"
                                required
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full flex-center" disabled={resetLoading}>
                            {resetLoading ? 'Sending...' : 'Send OTP'} <ChevronRight size={18} />
                        </button>
                        <button type="button" onClick={() => setView(forgotFrom)} className="link-text w-full mt-4">Back to Login</button>
                    </form>
                </>
            )}

            {forgotStage === 'otp' && (
                <>
                    <div className="header-section">
                        <div className="logo-box">
                            <ShieldCheck size={32} className="logo-icon" color="var(--accent-color)" />
                        </div>
                        <h1 className="title">Verify OTP</h1>
                        <p className="subtitle">Sent to: <strong>{resetEmail}</strong></p>
                    </div>
                    <form onSubmit={handleVerifyAndReset} className="auth-form">
                        {error && <p className="error-message" style={{ color: '#ff4d4f', textAlign: 'center' }}>{error}</p>}
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                className="input-field"
                                required
                                maxLength={6}
                                value={resetOTP}
                                onChange={(e) => setResetOTP(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                className="input-field"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm New Password"
                                className="input-field"
                                required
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                style={{ paddingRight: '45px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <button type="submit" className="btn-primary w-full flex-center" disabled={resetLoading}>
                            {resetLoading ? 'Verifying...' : 'Reset Password'} <ShieldCheck size={18} />
                        </button>
                        <button type="button" onClick={() => setForgotStage('email')} className="link-text w-full mt-4">Change Email</button>
                    </form>
                </>
            )}

            {forgotStage === 'success' && (
                <div style={{ textAlign: 'center' }}>
                    <div className="header-section">
                        <div className="logo-box" style={{ background: '#f6ffed', border: 'none' }}>
                            <ShieldCheck size={32} color="#52c41a" />
                        </div>
                        <h1 className="title">Reset Successful</h1>
                        <p className="subtitle">Password reset successful. Please log in with your new password.</p>
                    </div>
                    <button
                        onClick={() => {
                            setForgotStage('email');
                            setResetEmail('');
                            setResetOTP('');
                            setNewPassword('');
                            setConfirmNewPassword('');
                            setView(forgotFrom);
                        }}
                        className="btn-primary w-full"
                    >
                        Log In Now
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default ForgotPassword;
