import { useState, useEffect } from 'react';
import { getProducts } from '../aws-config';

export const useProducts = (view, locationPathname, cart, adminId) => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    const [recentlyViewed, setRecentlyViewed] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        } catch {
            return [];
        }
    });
    
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    const sanitizePhotoUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const rawUrl = String(url);
        const lowerUrl = rawUrl.toLowerCase();
        let index = lowerUrl.lastIndexOf('pictures/');
        if (index === -1) index = lowerUrl.lastIndexOf('pictures\\');
        if (index !== -1) {
            const fileName = rawUrl.substring(index).split(/[/\\]/).pop();
            return `/pictures/${fileName}`;
        }
        return url;
    };

    useEffect(() => {
        const fetchProducts = async () => {
            console.log("Fetching products for adminId:", adminId);
            const data = await getProducts(adminId);
            const sanitizedData = data.map(p => ({ ...p, photo: sanitizePhotoUrl(p.photo) }));
            setProducts(sanitizedData);
        };
        if (view === 'dashboard' || view === 'customer-products' || locationPathname?.startsWith('/admin')) {
            fetchProducts();
        }
    }, [view, locationPathname, adminId]);

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
        const cartProductIds = (cart || []).map(item => item.id);

        const productRelations = {
            'bread': ['butter', 'jam', 'cream', 'cake'],
            'cake': ['candle', 'cupcake', 'fruit'],
            'cream': ['bread', 'cake', 'fruit'],
            'fruit': ['cake', 'cream']
        };

        if (cart && cart.length > 0) {
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

        if (recommendations.length < 4) {
            const fallback = products.filter(p => !cartProductIds.includes(p.id));
            recommendations.push(...fallback);
        }

        const uniqueRecommendations = Array.from(
            new Map(recommendations.map(item => [item.id, item])).values()
        ).slice(0, 4);

        return uniqueRecommendations;
    };

    useEffect(() => {
        const recommendations = getRecommendations();
        setRecommendedProducts(recommendations);
    }, [cart, products, recentlyViewed]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    return {
        products, setProducts,
        searchQuery, setSearchQuery,
        filteredProducts,
        recentlyViewed, addToRecentlyViewed,
        recommendedProducts
    };
};
