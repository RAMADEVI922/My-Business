import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
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
    
    // Core Routing State
    const [view, setView] = useState(() => sessionStorage.getItem('app_view') || 'welcome');
    const [forgotFrom, setForgotFrom] = useState('login'); // 'login' (admin) or 'customer-login'
    
    // Navigation Persist
    useEffect(() => { sessionStorage.setItem('app_view', view); }, [view]);

    // Admin Route Sync: Ensure view is 'dashboard' if URL starts with /admin
    useEffect(() => {
        if (location.pathname.startsWith('/admin')) {
            setView('dashboard');
        }
    }, [location.pathname]);

    // Custom Hooks Integration
    const { 
        currentUser, customerType, setCustomerType, error, setError,
        handleAdminLogin: loginAdmin, 
        handleCustomerLogin: loginCustomer, 
        handleCustomerRegister: registerCustomer, 
        logout 
    } = useAuth(setView);

    const { 
        cart, setCart, addToCart, removeFromCart, updateQty, cartTotal, cartCount 
    } = useCart();
    
    const { 
        products, searchQuery, setSearchQuery, filteredProducts, 
        recentlyViewed, addToRecentlyViewed, recommendedProducts 
    } = useProducts(view, location.pathname, cart);

    const { 
        orders, setOrders, myOrders, setMyOrders, lastOrderId, 
        orderDetails, setOrderDetails, orderError, setOrderError, 
        handleConfirmOrder, handleCancelOrder 
    } = useOrders(currentUser, cart, cartTotal, setView);

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
                    onLogout={() => logout(setCart)} 
                />
            )}

             <main style={{ padding: ['welcome', 'dashboard', 'login', 'admin', 'register', 'customer-login', 'forgot-password', 'contact'].includes(view) ? '0' : '2rem', maxWidth: ['welcome', 'dashboard', 'login', 'admin', 'register', 'customer-login', 'forgot-password', 'contact'].includes(view) ? '100%' : '1200px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    {view === 'welcome' && <WelcomeScreen setView={setView} />}
                    {view === 'landing' && (
                        <LandingPage 
                            onSelectCustomerType={(type) => {
                                setCustomerType(type);
                                setView('register');
                            }} 
                            onNavigateToAdmin={() => setView('login')} 
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
                                return await getOrdersByEmail(email);
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
                            getOrders={async () => {
                                const { getOrders } = await import('./aws-config');
                                return await getOrders();
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
