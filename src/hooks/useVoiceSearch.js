import { useState } from 'react';

export function useVoiceSearch(products, onAddToCart) {
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

    return {
        isListening,
        voiceText,
        voiceNotification,
        handleVoiceSearch
    };
}
