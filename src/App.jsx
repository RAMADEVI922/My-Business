import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useUser, useAuth as useClerkAuth } from '@clerk/react';
import Navbar from './components/Navbar';

// Hooks
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import { useOrders } from './hooks/useOrders';
import { useAuth } from './hooks/useAuth';

// Components
import WelcomeScreen from './components/WelcomeScreen';
import LandingPage from './components/LandingPage';
import CustomerRegister from './components/CustomerRegister';
import CustomerLogin from './components/CustomerLogin';
import CustomerProducts from './components/CustomerProducts';
import CartView from './components/CartView';
import OrderAddress from './components/OrderAddress';
import MyOrders from './components/MyOrders';
import OrderConfirmed from './components/OrderConfirmed';
import ContactUs from './components/ContactUs';
import AdminLogin from './components/AdminLogin';
import ForgotPassword from './components/ForgotPassword';
import AdminDashboard from './components/AdminDashboard';

function App() {
    const location = useLocation();
    const { isLoaded, isSignedIn, user } = useUser();
    const { signOut: clerkSignOut } = useClerkAuth();

    // Read the one-time clerk_mode set when the user chose admin or customer on the landing page
    const clerkMode = sessionStorage.getItem('clerk_mode') || 'customer';

    // Core Routing State
    // Initialize view: if coming back as admin (clerk_mode=admin), start on 'login' to avoid
    // showing a stale customer view before the role effect can fire
    const [view, setView] = useState(() => {
        const savedView = sessionStorage.getItem('app_view') || 'welcome';
        // If we are in admin mode but sessionStorage has an old customer view, reset it
        const customerOnlyViews = ['customer-products', 'cart', 'order-address', 'my-orders', 'order-confirmed', 'contact'];
        if (clerkMode === 'admin' && customerOnlyViews.includes(savedView)) {
            return 'login';
        }
        return savedView;
    });
    const [forgotFrom, setForgotFrom] = useState('login'); // 'login' (admin) or 'customer-login'
    
    // Navigation Persist
    useEffect(() => { sessionStorage.setItem('app_view', view); }, [view]);

    // Role-based Access & Sync: fires once user data is available from Clerk
    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn || !user) return;
        
        const role = user.publicMetadata?.role;
        const isAdminMode = clerkMode === 'admin' || role === 'admin';
        
        if (isAdminMode) {
            setView('dashboard');
            sessionStorage.setItem('is_admin', 'true');
        } else {
            setView('customer-products');
            sessionStorage.removeItem('is_admin');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, isSignedIn, user]);

    // Custom Hooks Integration
    const { 
        currentUser, setCurrentUser, customerType, setCustomerType, error, setError,
        handleAdminLogin: loginAdmin, 
        handleCustomerLogin: loginCustomer, 
        handleCustomerRegister: registerCustomer, 
        logout 
    } = useAuth(setView);

    // Synchronize Clerk user with app's currentUser
    useEffect(() => {
        if (isSignedIn && user) {
            const userData = {
                email: user.primaryEmailAddress?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                type: user.publicMetadata?.role || 'customer'
            };
            
            // Only update if data actually changed to prevent render loops
            setCurrentUser(prev => {
                const isSame = prev && 
                    prev.email === userData.email && 
                    prev.firstName === userData.firstName && 
                    prev.lastName === userData.lastName &&
                    prev.type === userData.type;
                return isSame ? prev : userData;
            });
        } else if (isLoaded && !isSignedIn) {
            setCurrentUser(null);
        }
    }, [isSignedIn, user, isLoaded, setCurrentUser]);

    // Extract adminId — the unique Clerk userId of this admin (used for data scoping)
    // Only set when in admin mode. For customers, adminId from the store they registered with is used.
    const adminId = (clerkMode === 'admin' && isSignedIn && user) ? user.id : null;
    // For customer store scoping: the admin store they registered/shop with
    const customerAdminId = clerkMode !== 'admin' ? sessionStorage.getItem('store_admin_id') : null;

    const { 
        cart, setCart, addToCart, removeFromCart, updateQty, cartTotal, cartCount 
    } = useCart();
    
    const { 
        products, searchQuery, setSearchQuery, filteredProducts, 
        recentlyViewed, addToRecentlyViewed, recommendedProducts 
    } = useProducts(view, location.pathname, cart, adminId || customerAdminId);

    const { 
        orders, setOrders, myOrders, setMyOrders, lastOrderId, 
        orderDetails, setOrderDetails, orderError, setOrderError, 
        handleConfirmOrder, handleCancelOrder 
    } = useOrders(currentUser, cart, cartTotal, setView, adminId || customerAdminId);

    // Handlers with setters injected
    const wrappedAdminLogin = (e, formData) => loginAdmin(e, formData, setOrders);
    const wrappedCustomerLogin = (e, formData) => loginCustomer(e, formData, setMyOrders);
    const wrappedCustomerRegister = (e, formData, files, type) => registerCustomer(e, formData, files, type, setMyOrders);


    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
            {['welcome', 'dashboard', 'login', 'admin', 'register', 'customer-login', 'forgot-password'].includes(view) || location.pathname.startsWith('/admin') ? null : (
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

             <main style={{ padding: ['welcome', 'dashboard', 'login', 'admin', 'register', 'customer-login', 'forgot-password', 'contact'].includes(view) ? '0' : '2rem', maxWidth: ['welcome', 'dashboard', 'login', 'admin', 'register', 'customer-login', 'forgot-password', 'contact'].includes(view) ? '100%' : '1200px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    {view === 'welcome' && <WelcomeScreen setView={setView} />}
                    {view === 'landing' && (
                        <LandingPage 
                            onSelectCustomerType={(type) => {
                                sessionStorage.setItem('clerk_mode', 'customer');
                                sessionStorage.setItem('app_view', 'register');
                                sessionStorage.setItem('customer_type', type);
                                window.location.reload();
                            }} 
                            onNavigateToAdmin={() => {
                                sessionStorage.setItem('clerk_mode', 'admin');
                                sessionStorage.setItem('app_view', 'login');
                                window.location.reload();
                            }} 
                        />
                    )}
                    {view === 'register' && (
                        <CustomerRegister
                            customerType={customerType}
                            handleCustomerRegister={wrappedCustomerRegister}
                            error={error}
                            setView={setView}
                        />
                    )}
                    {view === 'customer-login' && (
                        <CustomerLogin
                            handleCustomerLogin={wrappedCustomerLogin}
                            error={error}
                            setView={setView}
                            setForgotFrom={setForgotFrom}
                        />
                    )}
                    {view === 'customer-products' && (
                        <CustomerProducts
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            filteredProducts={filteredProducts}
                            cart={cart}
                            addToCart={addToCart}
                            addToRecentlyViewed={addToRecentlyViewed}
                            recommendedProducts={recommendedProducts}
                            recentlyViewed={recentlyViewed}
                        />
                    )}
                    {view === 'cart' && (
                        <CartView
                            cart={cart}
                            cartCount={cartCount}
                            updateQty={updateQty}
                            removeFromCart={removeFromCart}
                            cartTotal={cartTotal}
                            recommendedProducts={recommendedProducts}
                            addToCart={addToCart}
                            setView={setView}
                            addToRecentlyViewed={addToRecentlyViewed}
                        />
                    )}
                    {view === 'order-address' && (
                        <OrderAddress
                            cartTotal={cartTotal}
                            cart={cart}
                            orderDetails={orderDetails}
                            setOrderDetails={setOrderDetails}
                            handleConfirmOrder={handleConfirmOrder}
                            orderError={orderError}
                            setView={setView}
                        />
                    )}
                    {view === 'my-orders' && (
                        <MyOrders
                            myOrders={myOrders}
                            setMyOrders={setMyOrders}
                            currentUser={currentUser}
                            handleCancelOrder={handleCancelOrder}
                            setView={setView}
                            getOrdersByEmail={async (email) => {
                                const { getOrdersByEmail } = await import('./aws-config');
                                return await getOrdersByEmail(email, customerAdminId);
                            }}
                            acceptProposedDate={async (id) => {
                                const { acceptProposedDate } = await import('./aws-config');
                                return await acceptProposedDate(id);
                            }}
                            rejectProposedDate={async (id) => {
                                const { rejectProposedDate } = await import('./aws-config');
                                return await rejectProposedDate(id);
                            }}
                        />
                    )}
                    {view === 'order-confirmed' && (
                        <OrderConfirmed
                            orderDetails={orderDetails}
                            lastOrderId={lastOrderId}
                            setView={setView}
                            setCart={setCart}
                            setOrderDetails={setOrderDetails}
                        />
                    )}
                    {view === 'contact' && <ContactUs setView={setView} />}
                    {view === 'login' && (
                        <AdminLogin
                            handleAdminLogin={wrappedAdminLogin}
                            error={error}
                            setView={setView}
                            setForgotFrom={setForgotFrom}
                        />
                    )}
                    {view === 'forgot-password' && (
                        <ForgotPassword setView={setView} forgotFrom={forgotFrom} />
                    )}
                    
                    {/* Admin Dashboard takes care of its own internal routing structure */}
                    {view === 'dashboard' && (
                        <AdminDashboard
                            setView={setView}
                            products={products}
                            orders={orders}
                            setOrders={setOrders}
                            adminId={adminId}
                            onLogout={() => {
                                clerkSignOut();
                                logout(setCart);
                            }}
                            getOrders={async () => {
                                const { getOrders } = await import('./aws-config');
                                return await getOrders(adminId);
                            }}
                            updateOrderStatus={async (id, status) => {
                                const { updateOrderStatus } = await import('./aws-config');
                                return await updateOrderStatus(id, status);
                            }}
                            proposeNewDeliveryDate={async (id, date, reason) => {
                                const { proposeNewDeliveryDate } = await import('./aws-config');
                                return await proposeNewDeliveryDate(id, date, reason);
                            }}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default App;
