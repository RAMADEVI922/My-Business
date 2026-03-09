import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Image } from 'lucide-react';
import { useUser } from '@clerk/react';

/**
 * Shop Owner Documents Upload Component
 * 
 * This page is shown after shop owner registration
 * Allows shop owners to upload required documents before accessing the store
 */
const ShopOwnerDocuments = ({ setView }) => {
    const { user } = useUser();
    const [shopImage, setShopImage] = useState(null);
    const [shopImagePreview, setShopImagePreview] = useState(null);
    const [identityProof, setIdentityProof] = useState(null);
    const [identityProofType, setIdentityProofType] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleShopImageChange = (e) => {
        const file = e.target.files[0];
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
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setShopImagePreview(reader.result);
            };
            reader.onerror = () => {
                setUploadError('Failed to load image preview');
            };
            reader.readAsDataURL(file);
            
            setUploadError('');
        }
    };

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
        // Validate all required fields
        if (!shopImage) {
            setUploadError('Please upload a shop image');
            return;
        }
        
        if (!identityProofType) {
            setUploadError('Please select an identity proof type');
            return;
        }
        
        if (!identityProof) {
            setUploadError('Please upload your identity proof document');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        try {
            // Upload to S3
            const { uploadToS3 } = await import('../aws-config');
            
            const shopImageUrl = await uploadToS3(shopImage, 'shop-images');
            const identityProofUrl = await uploadToS3(identityProof, 'identity-proofs');

            // Store in Clerk user's metadata
            if (user) {
                await user.update({
                    unsafeMetadata: {
                        shopImageUrl,
                        identityProofUrl,
                        identityProofType,
                        documentsUploaded: true,
                        uploadedAt: new Date().toISOString()
                    }
                });
            }

            // Success - redirect to store selector
            console.log('Documents uploaded successfully');
            setView('store-selector');
            
        } catch (error) {
            console.error('Error uploading documents:', error);
            setUploadError('Failed to upload documents. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div
            key="shop-owner-documents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
                maxWidth: '700px',
                margin: '2rem auto',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '24px',
                border: '2px solid rgba(194, 120, 53, 0.3)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
        >
            <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: '#c27835',
                marginBottom: '2rem',
                textAlign: 'center'
            }}>
                Shop Owner Documents
            </h2>

            {uploadError && (
                <div style={{
                    padding: '0.75rem',
                    background: '#fee',
                    color: '#c00',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                    border: '1px solid #fcc'
                }}>
                    ⚠️ {uploadError}
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
                        padding: '0.75rem',
                        border: '2px solid #c27835',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#2d1e12'
                    }}
                />
                {shopImage && (
                    <p style={{ 
                        marginTop: '0.5rem', 
                        color: '#10b981',
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
                        background: 'rgba(194, 120, 53, 0.05)',
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
                        color: identityProofType ? '#2d1e12' : '#000000'
                    }}
                >
                    <option value="" style={{ color: '#000000', fontWeight: 600 }}>-- Select Document Type --</option>
                    <option value="shop-license" style={{ color: '#2d1e12', fontWeight: 700 }}>🏪 Shop License</option>
                    <option value="pan-card" style={{ color: '#2d1e12', fontWeight: 700 }}>💳 PAN Card</option>
                    <option value="aadhaar-card" style={{ color: '#2d1e12', fontWeight: 700 }}>🆔 Aadhaar Card</option>
                </select>
            </div>

            {/* Identity Proof Upload */}
            <div style={{ marginBottom: '2rem' }}>
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
                        padding: '0.75rem',
                        border: '2px solid #c27835',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#2d1e12'
                    }}
                />
                {identityProof && (
                    <p style={{ 
                        marginTop: '0.5rem', 
                        color: '#10b981',
                        fontSize: '0.9rem',
                        fontWeight: 600
                    }}>
                        ✓ File selected: {identityProof.name}
                    </p>
                )}
            </div>

            {/* Upload Button */}
            <button
                onClick={handleUploadDocuments}
                disabled={isUploading}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: isUploading 
                        ? 'linear-gradient(135deg, #999, #777)' 
                        : 'linear-gradient(135deg, #c27835, #d97706)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isUploading ? 0.7 : 1
                }}
            >
                {isUploading ? 'Uploading Documents...' : 'Upload Documents'}
            </button>
        </motion.div>
    );
};

export default ShopOwnerDocuments;
