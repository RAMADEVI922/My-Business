import { useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/react';

/**
 * Custom hook to manage application state
 * Handles view state, authentication, and mode switching
 */
export const useAppState = () => {
    const { isLoaded, isSignedIn, user } = useUser();
    const { signOut: clerkSignOut } = useClerkAuth();
    
    const clerkMode = sessionStorage.getItem('clerk_mode') || 'customer';
    
    // Initialize view state
    const [view, setView] = useState(() => {
        const savedView = sessionStorage.getItem('app_view') || 'welcome';
        const customerOnlyViews = ['customer-products', 'cart', 'order-address', 'my-orders', 'order-confirmed', 'contact'];
        if (clerkMode === 'admin' && customerOnlyViews.includes(savedView)) {
            return 'login';
        }
        return savedView;
    });
    
    const [forgotFrom, setForgotFrom] = useState('login');
    
    // Persist view to sessionStorage
    useEffect(() => {
        sessionStorage.setItem('app_view', view);
    }, [view]);
    
    // Force logout check
    useEffect(() => {
        const forceLogout = sessionStorage.getItem('force_admin_logout');
        if (forceLogout === 'true' && isLoaded) {
            sessionStorage.removeItem('force_admin_logout');
            if (isSignedIn) {
                console.log('Force logout detected - signing out');
                clerkSignOut();
            }
        }
    }, [isLoaded, isSignedIn, clerkSignOut]);
    
    // Role-based access and auto-redirect
    useEffect(() => {
        if (!isLoaded) return;
        
        const noRedirectPages = ['welcome', 'landing'];
        if (noRedirectPages.includes(view)) return;
        
        if (view === 'login' && !isSignedIn) return;
        if ((view === 'register' || view === 'customer-login') && !isSignedIn) return;
        
        if (!isSignedIn || !user) return;
        
        const role = user.publicMetadata?.role;
        const isAdminMode = clerkMode === 'admin' || role === 'admin';
        
        if (isAdminMode) {
            if (view !== 'dashboard') {
                console.log('Admin authenticated, redirecting to dashboard');
                setView('dashboard');
            }
            sessionStorage.setItem('is_admin', 'true');
        } else {
            const hasSelectedStore = sessionStorage.getItem('store_admin_id');
            if (hasSelectedStore) {
                if (view !== 'customer-products') {
                    setView('customer-products');
                }
            } else {
                if (view !== 'store-selector') {
                    setView('store-selector');
                }
            }
            sessionStorage.removeItem('is_admin');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, isSignedIn, user]);
    
    // Extract adminId
    const adminId = (clerkMode === 'admin' && isSignedIn && user) ? user.id : null;
    const customerAdminId = clerkMode !== 'admin' ? sessionStorage.getItem('store_admin_id') : null;
    
    return {
        view,
        setView,
        forgotFrom,
        setForgotFrom,
        isLoaded,
        isSignedIn,
        user,
        clerkSignOut,
        clerkMode,
        adminId,
        customerAdminId
    };
};
