import React from 'react';
import { AnimatePresence } from 'framer-motion';
import WelcomeScreen from './WelcomeScreen';
import LandingPage from './LandingPage';
import CustomerRegister from '../../auth/components/CustomerRegister';
import CustomerLogin from '../../auth/components/CustomerLogin';
import ShopOwnerDocuments from '../../auth/components/ShopOwnerDocuments';
import CustomerProducts from '../../customer/components/CustomerProducts';
import CartView from '../../customer/components/CartView';
import OrderAddress from '../../customer/components/OrderAddress';
import MyOrders from '../../customer/components/MyOrders';
import OrderConfirmed from '../../customer/components/OrderConfirmed';
import ContactUs from './ContactUs';
import AdminLogin from '../../auth/components/AdminLogin';
import ForgotPassword from '../../auth/components/ForgotPassword';
import AdminDashboard from '../../admin/components/AdminDashboard';
import StoreSelector from '../../customer/components/StoreSelector';
import { handleSelectCustomerType, handleNavigateToAdmin } from '../../utils/navigationHandlers';

/**
 * AppRoutes Component
 * Handles all view routing and rendering based on current view state
 */
const AppRoutes = ({
    view,
    setView,
    forgotFrom,
    setForgotFrom,
    isSignedIn,
    customerType,
    error,
    wrappedCustomerRegister,
    wrappedCustomerLogin,
    wrappedAdminLogin,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateQty,
    cartTotal,
    cartCount,
    addToRecentlyViewed,
    recommendedProducts,
    recentlyViewed,
    orderDetails,
    setOrderDetails,
    handleConfirmOrder,
    orderError,
    myOrders,
    setMyOrders,
    currentUser,
    handleCancelOrder,
    customerAdminId,
    lastOrderId,
    products,
    orders,
    setOrders,
    adminId,
    clerkSignOut,
    logout
}) => {
    return (
        <AnimatePresence mode="wait">
            {view === 'welcome' && <WelcomeScreen setView={setView} />}
            
            {view === 'landing' && (
                <LandingPage 
                    onSelectCustomerType={(type) => handleSelectCustomerType(type, isSignedIn, setView)}
                    onNavigateToAdmin={() => handleNavigateToAdmin(isSignedIn, setView)}
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
            
            {view === 'shop-owner-documents' && (
                <ShopOwnerDocuments setView={setView} />
            )}
            
            {view === 'store-selector' && (
                <StoreSelector setView={setView} />
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
                        const { getOrdersByEmail } = await import('../../services/aws-config');
                        return await getOrdersByEmail(email, customerAdminId);
                    }}
                    acceptProposedDate={async (id) => {
                        const { acceptProposedDate } = await import('../../services/aws-config');
                        return await acceptProposedDate(id);
                    }}
                    rejectProposedDate={async (id) => {
                        const { rejectProposedDate } = await import('../../services/aws-config');
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
            
            {view === 'contact' && <ContactUs setView={setView} customerAdminId={customerAdminId} />}
            
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
                        const { getOrders } = await import('../../services/aws-config');
                        return await getOrders(adminId);
                    }}
                    updateOrderStatus={async (id, status) => {
                        const { updateOrderStatus } = await import('../../services/aws-config');
                        return await updateOrderStatus(id, status);
                    }}
                    proposeNewDeliveryDate={async (id, date, reason) => {
                        const { proposeNewDeliveryDate } = await import('../../services/aws-config');
                        return await proposeNewDeliveryDate(id, date, reason);
                    }}
                />
            )}
        </AnimatePresence>
    );
};

export default AppRoutes;
