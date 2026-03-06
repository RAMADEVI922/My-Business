import React from 'react';
import { motion } from 'framer-motion';
import { EyeOff, Eye, Upload } from 'lucide-react';

const CustomerRegister = ({
    customerType,
    handleCustomerRegister,
    error,
    setView
}) => {

    const [formData, setFormData] = React.useState({
        email: '', phone: '', address: '', password: '', confirmPassword: '',
        firstName: '', lastName: '', shopPicture: '', idType: 'pancard', idProof: ''
    });
    const [selectedFiles, setSelectedFiles] = React.useState({ shopPicture: null, idProof: null });
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e) => handleCustomerRegister(e, formData, selectedFiles, customerType);

    return (
        <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="customer-reg-container"
        >
            <h1 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {customerType === 'shop-owner' ? 'Register as Shop Owner' : 'Register as Customer'}
            </h1>
            <form onSubmit={onSubmit} className="customer-reg-form">
                <div className="input-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" className="customer-input" placeholder="First Name" required value={formData.firstName || ''} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                    <label>Last Name</label>
                    <input type="text" name="lastName" className="customer-input" placeholder="Last Name" required value={formData.lastName || ''} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" name="email" className="customer-input" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" className="customer-input" placeholder="Phone Number" required value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="customer-input"
                            placeholder="Password"
                            required
                            value={formData.password}
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
                <div className="input-group">
                    <label>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            className="customer-input"
                            placeholder="Confirm Password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            style={{ width: '100%', paddingRight: '45px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>Address</label>
                    <textarea name="address" className="customer-input" style={{ width: '100%', padding: '10px' }} placeholder="Full Address" required value={formData.address} onChange={handleInputChange}></textarea>
                </div>

                {customerType === 'shop-owner' && (
                    <>
                        <div className="input-group">
                            <label style={{ marginBottom: '8px', display: 'block' }}>Shop Front Photo</label>
                            <input
                                type="file"
                                id="shopPictureInput"
                                accept="image/*"
                                className="hidden-input"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) setSelectedFiles(prev => ({ ...prev, shopPicture: file }));
                                }}
                            />
                            <label htmlFor="shopPictureInput" className="file-label-btn">
                                <Upload size={18} />
                                {selectedFiles.shopPicture ? (
                                    <span style={{ color: 'var(--accent-color)' }}>{selectedFiles.shopPicture.name.length > 25 ? selectedFiles.shopPicture.name.substring(0, 22) + '...' : selectedFiles.shopPicture.name}</span>
                                ) : 'Choose Shop Photo'}
                            </label>
                        </div>
                        <div className="input-group">
                            <label>Identity Proof Type</label>
                            <select name="idType" className="customer-input" value={formData.idType} onChange={handleInputChange}>
                                <option value="pancard">PAN Card</option>
                                <option value="adharcard">Aadhar Card</option>
                                <option value="shoplicence">Shop Licence</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ marginBottom: '8px', display: 'block' }}>Identity Proof Document</label>
                            <input
                                type="file"
                                id="idProofInput"
                                accept="image/*,.pdf"
                                className="hidden-input"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) setSelectedFiles(prev => ({ ...prev, idProof: file }));
                                }}
                            />
                            <label htmlFor="idProofInput" className="file-label-btn">
                                <Upload size={18} />
                                {selectedFiles.idProof ? (
                                    <span style={{ color: 'var(--accent-color)' }}>{selectedFiles.idProof.name.length > 25 ? selectedFiles.idProof.name.substring(0, 22) + '...' : selectedFiles.idProof.name}</span>
                                ) : 'Choose Document'}
                            </label>
                        </div>
                    </>
                )}

                {error && <p className="error-message" style={{ color: 'red', gridColumn: 'span 2', textAlign: 'center' }}>{error}</p>}


                <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '15px', marginTop: '1rem' }}>Complete Registration</button>
                <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setView('customer-login')} className="link-text" style={{ color: '#888' }}>
                        Already have an account? Login
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default CustomerRegister;
