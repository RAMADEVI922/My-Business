import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './components/AppRoutes';

// Hooks
import { useAppState } from './hooks/useAppState';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import { useOrders } from './hooks/useOrders';
import { useAuth } from './hooks/useAuth';

/**
 * DUAL AUTHENTICATION SYSTEM
 * 
 * This application uses TWO separate Clerk accounts for authentication:
 * 
 * 1. ADMIN AUTHENTICATION (my_business_admin)
 *    - Clerk Instance: verified-impala-96
 *    - Key: VITE_CLERK_ADMIN_PUBLISHABLE_KEY
 *    - Used for: Admin users who manage products, orders, and settings
 *    - Flow: Landing Page → Admin Access → Admin Login (Clerk SignIn) → Dashboard
 * 
 * 2. CUSTOMER AUTHENTICATION (mybusiness)
 *    - Clerk Instance: lenient-crayfish-17
 *    - Key: VITE_CLERK_CUSTOMER_PUBLISHABLE_KEY
 *    - Used for: Regular customers and shop owners who purchase products
 *    - Flow: Landing Page → Select Customer Type → Register (Clerk SignUp) → Store Selector → Products
 * 
 * MODE SWITCHING:
 * - The 'clerk_mode' in sessionStorage determines which Clerk instance is loaded
 * - When switching modes, the page reloads to initialize the correct Clerk instance
 * - This ensures admin credentials are stored in the admin Clerk account
 * - And customer credentials are stored in the customer Clerk account
 */

function App() {
    const location = useLocation();
    
    // App state management
    const {
        view,
        setView,
        forgotFrom,
        setForgotFrom,
        isSignedIn,
        user,
        clerkSignOut,
        adminId,
        customerAdminId
    } = useAppState();

    // Authentication
    const { 
        currentUser,
        setCurrentUser,
        customerType,
        error,
        handleAdminLogin: loginAdmin, 
        handleCustomerLogin: loginCustomer, 
        handleCustomerRegister: registerCustomer, 
        logout 
    } = useAuth(setView);

    // Cart management (must be before the useEffect that uses setCart)
    const { 
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQty,
        cartTotal,
        cartCount 
    } = useCart();

    // Synchronize Clerk user with app's currentUser
    useEffect(() => {
        if (isSignedIn && user) {
            const userData = {
                email: user.primaryEmailAddress?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                type: user.publicMetadata?.role || 'customer'
            };
            
            setCurrentUser(prev => {
                const isSame = prev && 
                    prev.email === userData.email && 
                    prev.firstName === userData.firstName && 
                    prev.lastName === userData.lastName &&
                    prev.type === userData.type;
                return isSame ? prev : userData;
            });
            
            // If admin, update their profile with Clerk user ID
            if (adminId && userData.email) {
                const updateAdminWithClerkId = async () => {
                    const { updateAdminProfile } = await import('./aws-config');
                    const storeName = `${user.firstName} ${user.lastName}`.trim() || user.username;
                    await updateAdminProfile(userData.email, user.id, storeName);
                };
                updateAdminWithClerkId();
            }
        } else if (!isSignedIn) {
            // User signed out - clean up state
            setCurrentUser(null);
            setCart([]);
        }
    }, [isSignedIn, user, setCurrentUser, adminId, setCart]);

    // Auto-logout when page is closed or user leaves
    useEffect(() => {
        if (!isSignedIn) return;

        const handleBeforeUnload = (e) => {
            // Log out the user
            console.log('Page closing - logging out user');
            clerkSignOut();
            
            // Clear all session data
            sessionStorage.clear();
            localStorage.clear();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Page is being hidden (tab closed, switched, or minimized)
                console.log('Page hidden - logging out user');
                clerkSignOut();
                sessionStorage.clear();
                localStorage.clear();
            }
        };

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isSignedIn, clerkSignOut]);
    
    // Products management
    const { 
        products,
        searchQuery,
        setSearchQuery,
        filteredProducts, 
        recentlyViewed,
        addToRecentlyViewed,
        recommendedProducts 
    } = useProducts(view, location.pathname, cart, adminId || customerAdminId);

    // Orders management
    const { 
        orders,
        setOrders,
        myOrders,
        setMyOrders,
        lastOrderId, 
        orderDetails,
        setOrderDetails,
        orderError,
        handleConfirmOrder,
        handleCancelOrder 
    } = useOrders(currentUser, cart, cartTotal, setView, adminId || customerAdminId);

    // Wrapped handlers with setters injected
    const wrappedAdminLogin = (e, formData) => loginAdmin(e, formData, setOrders);
    const wrappedCustomerLogin = (e, formData) => loginCustomer(e, formData, setMyOrders);
    const wrappedCustomerRegister = (e, formData, files, type) => registerCustomer(e, formData, files, type, setMyOrders);

    // Views that should hide the navbar
    const noNavbarViews = ['welcome', 'dashboard', 'login', 'admin', 'register', 'customer-login', 'forgot-password', 'store-selector'];
    const showNavbar = !noNavbarViews.includes(view) && !location.pathname.startsWith('/admin');

    // Views that should have no padding
    const noPaddingViews = ['welcome', 'dashboard', 'login', 'admin', 'register', 'customer-login', 'forgot-password', 'contact', 'store-selector'];
    const mainPadding = noPaddingViews.includes(view) ? '0' : '2rem';
    const mainMaxWidth = noPaddingViews.includes(view) ? '100%' : '1200px';

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--bg-color)', 
            color: 'var(--text-primary)', 
            fontFamily: "'Inter', sans-serif" 
        }}>
            {showNavbar && (
                <Navbar 
                    currentUser={currentUser} 
                    cartCount={cartCount} 
                    onNavigate={setView} 
                    onLogout={() => {
                        clerkSignOut();
                        logout(setCart);
                    }} 
                />
            )}

            <main style={{ 
                padding: mainPadding, 
                maxWidth: mainMaxWidth, 
                margin: '0 auto' 
            }}>
                <AppRoutes
                    view={view}
                    setView={setView}
                    forgotFrom={forgotFrom}
                    setForgotFrom={setForgotFrom}
                    isSignedIn={isSignedIn}
                    customerType={customerType}
                    error={error}
                    wrappedCustomerRegister={wrappedCustomerRegister}
                    wrappedCustomerLogin={wrappedCustomerLogin}
                    wrappedAdminLogin={wrappedAdminLogin}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredProducts={filteredProducts}
                    cart={cart}
                    setCart={setCart}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    updateQty={updateQty}
                    cartTotal={cartTotal}
                    cartCount={cartCount}
                    addToRecentlyViewed={addToRecentlyViewed}
                    recommendedProducts={recommendedProducts}
                    recentlyViewed={recentlyViewed}
                    orderDetails={orderDetails}
                    setOrderDetails={setOrderDetails}
                    handleConfirmOrder={handleConfirmOrder}
                    orderError={orderError}
                    myOrders={myOrders}
                    setMyOrders={setMyOrders}
                    currentUser={currentUser}
                    handleCancelOrder={handleCancelOrder}
                    customerAdminId={customerAdminId}
                    lastOrderId={lastOrderId}
                    products={products}
                    orders={orders}
                    setOrders={setOrders}
                    adminId={adminId}
                    clerkSignOut={clerkSignOut}
                    logout={logout}
                />
            </main>
        </div>
    );
}

export default App;
