import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SignUp, useSignUp } from '@clerk/react';
import { Upload, FileText, Image } from 'lucide-react';

/**
 * Customer Registration Component
 * 
 * Uses Clerk SignUp component with the CUSTOMER Clerk instance (mybusiness - lenient-crayfish-17)
 * This component is only rendered when clerk_mode is set to 'customer' in sessionStorage
 * Customer credentials are stored in the customer Clerk account, separate from admin credentials
 * 
 * For shop owners, additional fields are shown for shop image and identity proof
 */
const CustomerRegister = ({ setView, customerType }) => {
    const { signUp } = useSignUp();
    const [shopImage, setShopImage] = useState(null);
    const [shopImagePreview, setShopImagePreview] = useState(null);
    const [identityProof, setIdentityProof] = useState(null);
    const [identityProofType, setIdentityProofType] = useState('');
    const [uploadError, setUploadError] = useState('');

    const title = customerType === 'shop-owner' 
        ? 'Shop Owner - Create Your Account' 
        : 'Customer - Create Your Account';

    const isShopOwner = customerType === 'shop-owner';

    const handleShopImageChange = (e) => {
        const file = e.target.files[0];
        console.log('File selected:', file);
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setUploadError('Please select a valid image file');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setUploadError('Shop image must be less than 5MB');
                return;
            }
            
            setShopImage(file);
            
            // Use FileReader for more reliable preview
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Image loaded via FileReader');
                setShopImagePreview(reader.result);
            };
            reader.onerror = () => {
                console.error('FileReader error');
                setUploadError('Failed to load image preview');
            };
            reader.readAsDataURL(file);
            
            setUploadError('');
        }
    };

    // Cleanup is no longer needed since we're using data URL
    React.useEffect(() => {
        return () => {
            // Cleanup if needed
        };
    }, []);

    const handleIdentityProofChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setUploadError('Identity proof must be less than 5MB');
                return;
            }
            setIdentityProof(file);
            setUploadError('');
        }
    };

    const handleUploadDocuments = async () => {
        if (isShopOwner && (!shopImage || !identityProof || !identityProofType)) {
            setUploadError('Please upload shop image and identity proof');
            return false;
        }

        try {
            // Upload to S3 and store URLs in Clerk user metadata
            const { uploadToS3 } = await import('../aws-config');
            
            let shopImageUrl = '';
            let identityProofUrl = '';

            if (shopImage) {
                shopImageUrl = await uploadToS3(shopImage, 'shop-images');
            }
            if (identityProof) {
                identityProofUrl = await uploadToS3(identityProof, 'identity-proofs');
            }

            // Store in Clerk user's public metadata
            if (signUp) {
                await signUp.update({
                    unsafeMetadata: {
                        shopImageUrl,
                        identityProofUrl,
                        identityProofType,
                        customerType
                    }
                });
            }

            return true;
        } catch (error) {
            console.error('Error uploading documents:', error);
            setUploadError('Failed to upload documents. Please try again.');
            return false;
        }
    };

    return (
        <motion.div
            key="register"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="customer-register-wrapper"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}
        >
            <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                color: '#c27835',
                marginBottom: '1rem',
                textAlign: 'center'
            }}>
                {title}
            </h2>

            {/* Clerk SignUp Component */}
            <SignUp 
                routing="hash"
                signInUrl="/customer-login"
            />

            {/* Additional Fields for Shop Owners */}
            {isShopOwner && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(194, 120, 53, 0.3)',
                        marginTop: '1rem'
                    }}
                >
                    <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 600, 
                        color: '#c27835',
                        marginBottom: '1rem'
                    }}>
                        Shop Owner Documents
                    </h3>

                    {uploadError && (
                        <div style={{
                            padding: '0.75rem',
                            background: '#fee',
                            color: '#c00',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            {uploadError}
                        </div>
                    )}

                    {/* Shop Image Upload */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: '#c27835',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            <Image size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Shop Image *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleShopImageChange}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '2px solid #c27835',
                                borderRadius: '8px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        />
                        {shopImage && (
                            <p style={{ 
                                marginTop: '0.5rem', 
                                color: '#4ade80',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}>
                                ✓ File selected: {shopImage.name}
                            </p>
                        )}
                        {shopImagePreview && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'rgba(194, 120, 53, 0.1)',
                                borderRadius: '8px',
                                border: '2px solid #c27835',
                                textAlign: 'center'
                            }}>
                                <p style={{ 
                                    color: '#c27835', 
                                    fontWeight: 600,
                                    marginBottom: '0.75rem',
                                    fontSize: '0.95rem'
                                }}>
                                    ✓ Shop Image Preview
                                </p>
                                <img 
                                    src={shopImagePreview} 
                                    alt="Shop preview" 
                                    onLoad={() => console.log('Image loaded successfully')}
                                    onError={(e) => console.error('Image failed to load:', e)}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '250px',
                                        borderRadius: '8px',
                                        objectFit: 'contain',
                                        border: '2px solid #c27835',
                                        background: 'white',
                                        padding: '0.5rem',
                                        display: 'block',
                                        margin: '0 auto'
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Identity Proof Type */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: '#c27835',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            <FileText size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Identity Proof Type *
                        </label>
                        <select
                            value={identityProofType}
                            onChange={(e) => setIdentityProofType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #c27835',
                                borderRadius: '8px',
                                background: 'white',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                color: identityProofType ? '#333' : '#666'
                            }}
                        >
                            <option value="" style={{ color: '#999', fontWeight: 500 }}>-- Select Document Type --</option>
                            <option value="shop-license" style={{ color: '#333', fontWeight: 700, padding: '0.5rem' }}>🏪 Shop License</option>
                            <option value="pan-card" style={{ color: '#333', fontWeight: 700, padding: '0.5rem' }}>💳 PAN Card</option>
                            <option value="aadhaar-card" style={{ color: '#333', fontWeight: 700, padding: '0.5rem' }}>🆔 Aadhaar Card</option>
                        </select>
                    </div>

                    {/* Identity Proof Upload */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: '#c27835',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            <Upload size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Upload Identity Proof *
                        </label>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleIdentityProofChange}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '2px solid #c27835',
                                borderRadius: '8px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        />
                        {identityProof && (
                            <p style={{ 
                                marginTop: '0.5rem', 
                                color: '#4ade80',
                                fontSize: '0.9rem'
                            }}>
                                ✓ {identityProof.name}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleUploadDocuments}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: 'linear-gradient(135deg, #c27835, #d97706)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        Upload Documents
                    </button>
                </motion.div>
            )}

            <button 
                type="button" 
                onClick={() => setView('customer-login')} 
                className="link-text" 
                style={{ color: '#c27835', fontWeight: 600, marginTop: '1rem' }}
            >
                Already have an account? Login
            </button>
        </motion.div>
    );
};

export default CustomerRegister;
