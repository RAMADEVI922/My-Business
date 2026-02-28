import { useState, useEffect } from 'react';

export function useRecommendations(products, cart) {
    const [recentlyViewed, setRecentlyViewed] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        } catch {
            return [];
        }
    });
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    const addToRecentlyViewed = (product) => {
        setRecentlyViewed(prev => {
            const filtered = prev.filter(p => p.id !== product.id);
            const updated = [product, ...filtered].slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));
            return updated;
        });
    };

    const getRecommendations = () => {
        if (products.length === 0) return [];

        let recommendations = [];
        const cartProductIds = cart.map(item => item.id);

        const productRelations = {
            'bread': ['butter', 'jam', 'cream', 'cake'],
            'cake': ['candle', 'cupcake', 'fruit'],
            'cream': ['bread', 'cake', 'fruit'],
            'fruit': ['cake', 'cream']
        };

        // Recommendations based on cart items
        if (cart.length > 0) {
            cart.forEach(cartItem => {
                const itemNameLower = cartItem.name.toLowerCase();
                
                Object.keys(productRelations).forEach(keyword => {
                    if (itemNameLower.includes(keyword)) {
                        const relatedKeywords = productRelations[keyword];
                        
                        relatedKeywords.forEach(relatedKeyword => {
                            const related = products.filter(p => 
                                p.name.toLowerCase().includes(relatedKeyword) &&
                                !cartProductIds.includes(p.id) &&
                                p.id !== cartItem.id
                            );
                            recommendations.push(...related);
                        });
                    }
                });
            });
        }

        // Recommendations based on recently viewed
        if (recommendations.length < 4 && recentlyViewed.length > 0) {
            recentlyViewed.forEach(viewedProduct => {
                const viewedNameLower = viewedProduct.name.toLowerCase();
                
                Object.keys(productRelations).forEach(keyword => {
                    if (viewedNameLower.includes(keyword)) {
                        const relatedKeywords = productRelations[keyword];
                        
                        relatedKeywords.forEach(relatedKeyword => {
                            const related = products.filter(p => 
                                p.name.toLowerCase().includes(relatedKeyword) &&
                                !cartProductIds.includes(p.id) &&
                                p.id !== viewedProduct.id
                            );
                            recommendations.push(...related);
                        });
                    }
                });
            });
        }

        // Fallback: Show random products not in cart
        if (recommendations.length < 4) {
            const fallback = products.filter(p => !cartProductIds.includes(p.id));
            recommendations.push(...fallback);
        }

        // Remove duplicates and limit to 4
        const uniqueRecommendations = Array.from(
            new Map(recommendations.map(item => [item.id, item])).values()
        ).slice(0, 4);

        return uniqueRecommendations;
    };

    useEffect(() => {
        const recommendations = getRecommendations();
        setRecommendedProducts(recommendations);
    }, [cart, products, recentlyViewed]);

    return {
        recentlyViewed,
        recommendedProducts,
        addToRecentlyViewed
    };
}
