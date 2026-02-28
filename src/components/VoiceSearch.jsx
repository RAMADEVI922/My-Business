import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';

export default function VoiceSearch({ products, onAddToCart }) {
    const [isListening, setIsListening] = useState(false);
    const [voiceText, setVoiceText] = useState('');
    const [voiceNotification, setVoiceNotification] = useState({ show: false, message: '', type: '' });

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setVoiceNotification({
                show: true,
                message: 'Voice search is not supported in your browser. Please try Chrome or Edge.',
                type: 'error'
            });
            setTimeout(() => setVoiceNotification({ show: false, message: '', type: '' }), 4000);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceText('Listening...');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            setVoiceText(`You said: "${transcript}"`);
            
            const parseVoiceCommand = (text) => {
                const numberWords = {
                    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
                    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
                    'a': 1, 'an': 1
                };

                let cleanText = text
                    .replace(/add|to|cart|please|the|my/gi, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                const segments = cleanText.split(/\s+and\s+|,\s*/);
                const parsedItems = [];

                segments.forEach(segment => {
                    segment = segment.trim();
                    if (!segment) return;

                    const match = segment.match(/^(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an)?\s*(.+)$/i);
                    
                    if (match) {
                        let quantity = 1;
                        let productText = match[2] || match[1] || segment;

                        if (match[1]) {
                            const numStr = match[1].toLowerCase();
                            quantity = numberWords[numStr] || parseInt(match[1]) || 1;
                            productText = match[2];
                        }

                        productText = productText.trim().replace(/s$/, '');
                        parsedItems.push({ quantity, searchText: productText });
                    }
                });

                return parsedItems;
            };

            const parsedItems = parseVoiceCommand(transcript);
            
            if (parsedItems.length === 0) {
                setVoiceNotification({
                    show: true,
                    message: `✗ Could not understand the command. Try saying "Add 2 breads and 1 cake"`,
                    type: 'error'
                });
                setTimeout(() => {
                    setVoiceNotification({ show: false, message: '', type: '' });
                    setVoiceText('');
                }, 4000);
                return;
            }

            let addedCount = 0;
            let totalQuantity = 0;
            const notFoundItems = [];
            const addedItems = [];

            parsedItems.forEach(item => {
                const matchedProduct = products.find(product => {
                    const productName = product.name.toLowerCase();
                    const searchText = item.searchText.toLowerCase();
                    
                    return productName === searchText || 
                           productName.includes(searchText) || 
                           searchText.includes(productName) ||
                           productName.replace(/\s+/g, '') === searchText.replace(/\s+/g, '');
                });

                if (matchedProduct) {
                    onAddToCart(matchedProduct, item.quantity);
                    addedCount++;
                    totalQuantity += item.quantity;
                    addedItems.push(`${item.quantity}x ${matchedProduct.name}`);
                } else {
                    notFoundItems.push(item.searchText);
                }
            });

            if (addedCount > 0) {
                const itemsList = addedItems.join(', ');
                setVoiceNotification({
                    show: true,
                    message: `✓ ${totalQuantity} item${totalQuantity > 1 ? 's' : ''} added to cart! (${itemsList})`,
                    type: 'success'
                });
            }

            if (notFoundItems.length > 0 && addedCount === 0) {
                setVoiceNotification({
                    show: true,
                    message: `✗ No matching products found for: ${notFoundItems.join(', ')}`,
                    type: 'error'
                });
            } else if (notFoundItems.length > 0) {
                setTimeout(() => {
                    setVoiceNotification({
                        show: true,
                        message: `⚠️ Could not find: ${notFoundItems.join(', ')}`,
                        type: 'warning'
                    });
                }, 3500);
            }

            setTimeout(() => {
                setVoiceNotification({ show: false, message: '', type: '' });
                setVoiceText('');
            }, notFoundItems.length > 0 ? 7000 : 4000);
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            setVoiceText('');
            
            let errorMessage = 'Voice search failed. Please try again.';
            if (event.error === 'not-allowed') {
                errorMessage = 'Microphone access is required to use voice search.';
            } else if (event.error === 'no-speech') {
                errorMessage = 'No speech detected. Please try again.';
            }
            
            setVoiceNotification({ show: true, message: errorMessage, type: 'error' });
            setTimeout(() => setVoiceNotification({ show: false, message: '', type: '' }), 4000);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <>
            <AnimatePresence>
                {voiceNotification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`voice-notification ${voiceNotification.type}`}
                        style={{
                            position: 'fixed',
                            top: '100px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 2000,
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                            background: voiceNotification.type === 'success' 
                                ? 'linear-gradient(135deg, #10b981, #059669)' 
                                : 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white'
                        }}
                    >
                        {voiceNotification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {voiceText && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="voice-text-display"
                    style={{
                        textAlign: 'center',
                        padding: '1.25rem 1.5rem',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(194, 120, 53, 0.15), rgba(194, 120, 53, 0.05))',
                        borderRadius: '16px',
                        border: '2px solid rgba(194, 120, 53, 0.4)',
                        color: 'var(--text-primary)',
                        fontSize: '1.05rem',
                        fontWeight: 500,
                        boxShadow: '0 4px 15px rgba(194, 120, 53, 0.2)',
                        animation: 'pulse-border 2s infinite'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎤</span>
                        <span>{voiceText}</span>
                    </div>
                </motion.div>
            )}

            <motion.button
                onClick={handleVoiceSearch}
                disabled={isListening}
                className="voice-search-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'relative',
                    background: isListening 
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                        : 'linear-gradient(135deg, #c27835, #d97706)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isListening ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(194, 120, 53, 0.4)',
                    transition: 'all 0.3s ease'
                }}
            >
                <Mic size={28} color="white" />
                {isListening && (
                    <motion.div
                        className="listening-pulse"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: '50%',
                            border: '3px solid #ef4444',
                            animation: 'pulse-ring 1.5s infinite'
                        }}
                    />
                )}
            </motion.button>
        </>
    );
}
