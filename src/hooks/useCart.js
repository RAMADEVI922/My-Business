import { useState, useEffect } from 'react';

export const useCart = () => {
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('app_cart')) || []; } catch { return []; }
    });

    useEffect(() => {
        sessionStorage.setItem('app_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + quantity } : item);
            }
            return [...prev, { ...product, qty: quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQty = (productId, delta) => {
        setCart(prev => prev
            .map(item => item.id === productId ? { ...item, qty: item.qty + delta } : item)
            .filter(item => item.qty > 0)
        );
    };

    const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    return {
        cart, setCart,
        addToCart, removeFromCart, updateQty,
        cartTotal, cartCount
    };
};
