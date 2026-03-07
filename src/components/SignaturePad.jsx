import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, RotateCcw } from 'lucide-react';

/**
 * SignaturePad Component
 * 
 * Allows customers to sign for delivery confirmation
 * Works on mobile (touch), tablet, and desktop (mouse)
 * Captures signature as base64 image
 */
const SignaturePad = ({ onSave, onCancel, orderId }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            const ctx = canvas.getContext('2d');
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            
            // Set drawing styles
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        if (e.touches && e.touches[0]) {
            // Touch event
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else {
            // Mouse event
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        setIsEmpty(false);
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const coords = getCoordinates(e);
        
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const coords = getCoordinates(e);
        
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
    };

    const saveSignature = async () => {
        if (isEmpty) {
            alert('Please provide a signature before saving');
            return;
        }

        setIsSaving(true);
        try {
            const canvas = canvasRef.current;
            const signatureDataUrl = canvas.toDataURL('image/png');
            
            // Call the onSave callback with signature data
            await onSave(signatureDataUrl);
        } catch (error) {
            console.error('Error saving signature:', error);
            alert('Failed to save signature. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem'
            }}
        >
            <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    maxWidth: '600px',
                    width: '100%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#333',
                            margin: 0
                        }}>
                            Delivery Confirmation
                        </h2>
                        <p style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            margin: '0.25rem 0 0 0'
                        }}>
                            Order ID: {orderId}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#666'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Instructions */}
                <p style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    Please sign below to confirm delivery
                </p>

                {/* Canvas */}
                <div style={{
                    border: '2px dashed #c27835',
                    borderRadius: '12px',
                    background: '#fafafa',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{
                            width: '100%',
                            height: '250px',
                            cursor: 'crosshair',
                            touchAction: 'none'
                        }}
                    />
                    {isEmpty && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#999',
                            fontSize: '1rem',
                            pointerEvents: 'none',
                            textAlign: 'center'
                        }}>
                            Sign here with your finger or mouse
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={clearSignature}
                        disabled={isEmpty}
                        style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0.875rem',
                            background: isEmpty ? '#e0e0e0' : 'white',
                            border: '2px solid #c27835',
                            borderRadius: '8px',
                            color: isEmpty ? '#999' : '#c27835',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isEmpty ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <RotateCcw size={18} />
                        Clear
                    </button>
                    <button
                        onClick={saveSignature}
                        disabled={isEmpty || isSaving}
                        style={{
                            flex: 2,
                            minWidth: '150px',
                            padding: '0.875rem',
                            background: isEmpty || isSaving ? '#e0e0e0' : 'linear-gradient(135deg, #c27835, #d97706)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: isEmpty || isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Check size={18} />
                        {isSaving ? 'Saving...' : 'Confirm Delivery'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SignaturePad;
