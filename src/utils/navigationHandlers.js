/**
 * Navigation handler functions for mode switching
 */

export const handleSelectCustomerType = (type, isSignedIn, setView) => {
    const currentMode = sessionStorage.getItem('clerk_mode');
    sessionStorage.setItem('clerk_mode', 'customer');
    sessionStorage.setItem('customer_type', type);
    
    // Always go to register page for customer type selection
    // Reload if switching from admin mode or no mode was set
    if (currentMode === 'admin' || !currentMode) {
        sessionStorage.setItem('app_view', 'register');
        console.log('Switching to Customer mode - reloading to load customer Clerk instance');
        window.location.reload();
    } else {
        // Already in customer mode, just navigate to register
        setView('register');
    }
};

export const handleNavigateToAdmin = (isSignedIn, setView) => {
    const currentMode = sessionStorage.getItem('clerk_mode');
    
    // Check if already in admin mode and signed in
    if (currentMode === 'admin' && isSignedIn) {
        // Already logged in as admin, go directly to dashboard
        console.log('Already logged in as admin, going to dashboard');
        setView('dashboard');
    } else {
        // Not logged in or switching from customer mode
        // Set flag to force logout if switching modes
        if (currentMode === 'customer' && isSignedIn) {
            sessionStorage.setItem('force_admin_logout', 'true');
        }
        
        sessionStorage.setItem('clerk_mode', 'admin');
        sessionStorage.setItem('app_view', 'login');
        sessionStorage.removeItem('is_admin');
        
        console.log('Navigating to Admin Login - reloading');
        window.location.reload();
    }
};
