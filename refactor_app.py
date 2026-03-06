import sys

file_path = r'c:\Users\hp\Desktop\project\adminpage\src\App.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

imports_str = """
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
"""

# Insert imports after existing imports
insert_idx = 0
for i, line in enumerate(lines):
    if line.startswith('import ') or line.strip() == '':
        insert_idx = i + 1
    else:
        if 'function App()' in line:
            break

lines.insert(insert_idx, imports_str)

# Find the start of `return (` inside App function
return_start = -1
for i, line in enumerate(lines):
    if line.strip() == 'return (' and i + 1 < len(lines) and "app-container" in lines[i+1]:
        return_start = i
        break

if return_start == -1:
    print("Could not find return statement")
    sys.exit(1)

new_return_str = """
    return (
        <div className={`app-container ${(view === 'login' || view === 'forgot' || view === 'order-confirmed' || view === 'welcome') ? 'flex-center-all' : ''}`}>
            {(view !== 'welcome' && (view === 'landing' || view.startsWith('customer') || view === 'my-orders')) && renderNavbar()}

            <AnimatePresence mode="wait">
                {view === 'welcome' && <WelcomeScreen setView={setView} />}
                {view === 'landing' && <LandingPage setView={setView} setCustomerType={setCustomerType} />}
                {view === 'customer-register' && (
                    <CustomerRegister 
                        customerType={customerType} 
                        formData={formData} 
                        handleInputChange={handleInputChange} 
                        handleCustomerRegister={handleCustomerRegister} 
                        error={error} 
                        showPassword={showPassword} 
                        setShowPassword={setShowPassword} 
                        showConfirmPassword={showConfirmPassword} 
                        setShowConfirmPassword={setShowConfirmPassword} 
                        selectedFiles={selectedFiles} 
                        setSelectedFiles={setSelectedFiles} 
                    />
                )}
                {view === 'customer-login' && (
                    <CustomerLogin 
                        handleCustomerLogin={handleCustomerLogin} 
                        error={error} 
                        formData={formData} 
                        handleInputChange={handleInputChange} 
                        showPassword={showPassword} 
                        setShowPassword={setShowPassword} 
                        setForgotFrom={setForgotFrom} 
                        setView={setView} 
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
                        setView={setView} 
                        cartCount={cartCount} 
                        cart={cart} 
                        updateQty={updateQty} 
                        removeFromCart={removeFromCart} 
                        cartTotal={cartTotal} 
                        recommendedProducts={recommendedProducts} 
                        addToRecentlyViewed={addToRecentlyViewed} 
                        addToCart={addToCart} 
                    />
                )}
                {view === 'order-address' && (
                    <OrderAddress 
                        setView={setView} 
                        orderDetails={orderDetails} 
                        setOrderDetails={setOrderDetails} 
                        handleConfirmOrder={handleConfirmOrder} 
                        orderError={orderError} 
                        cart={cart} 
                        cartTotal={cartTotal} 
                    />
                )}
                {view === 'my-orders' && (
                    <MyOrders 
                        setView={setView} 
                        myOrders={myOrders} 
                        setMyOrders={setMyOrders} 
                        currentUser={currentUser} 
                        handleCancelOrder={handleCancelOrder} 
                        getOrdersByEmail={getOrdersByEmail} 
                        acceptProposedDate={acceptProposedDate} 
                        rejectProposedDate={rejectProposedDate} 
                    />
                )}
                {view === 'order-confirmed' && (
                    <OrderConfirmed 
                        orderDetails={orderDetails} 
                        lastOrderId={lastOrderId} 
                        setCart={setCart} 
                        setOrderDetails={setOrderDetails} 
                        setView={setView} 
                    />
                )}
                {view === 'contact-us' && <ContactUs setView={setView} />}
                {view === 'login' && (
                    <AdminLogin 
                        handleAdminLogin={handleAdminLogin} 
                        error={error} 
                        handleInputChange={handleInputChange} 
                        showPassword={showPassword} 
                        setShowPassword={setShowPassword} 
                        setForgotFrom={setForgotFrom} 
                        setView={setView} 
                    />
                )}
                {view === 'forgot' && (
                    <ForgotPassword 
                        forgotStage={forgotStage} 
                        setForgotStage={setForgotStage} 
                        resetEmail={resetEmail} 
                        setResetEmail={setResetEmail} 
                        handleSendOTP={async (e) => {
                            e.preventDefault();
                            setResetLoading(true);
                            setError('');
                            try {
                                const response = await getAdminByEmail(resetEmail);
                                if (response.items && response.items.length > 0) {
                                    const otp = Math.floor(100000 + Math.random() * 900000).toString();
                                    const saved = await saveOTP(resetEmail, otp);
                                    if (saved) {
                                        const emailSent = await sendPasswordResetEmail(resetEmail, otp);
                                        if (emailSent) {
                                            setForgotStage('otp');
                                        } else {
                                            setError('Failed to send OTP via email. Check AWS SES configuration.');
                                        }
                                    } else {
                                        setError('Error saving OTP.');
                                    }
                                } else {
                                    setError('Admin email not found in records.');
                                }
                            } catch (err) {
                                setError('Error: ' + err.message);
                            } finally {
                                setResetLoading(false);
                            }
                        }} 
                        error={error} 
                        resetLoading={resetLoading} 
                        handleVerifyAndReset={async (e) => {
                            e.preventDefault();
                            if (newPassword !== confirmNewPassword) {
                                setError("Passwords do not match.");
                                return;
                            }
                            setResetLoading(true);
                            setError('');
                            try {
                                const isValid = await verifyOTP(resetEmail, resetOTP);
                                if (isValid) {
                                    const admin = await getAdminByEmail(resetEmail);
                                    if (admin.items && admin.items.length > 0) {
                                        const adminId = admin.items[0].id;
                                        await updateAdminPassword(adminId, newPassword);
                                        setForgotStage('success');
                                    } else {
                                        setError('Admin not found after OTP verification.');
                                    }
                                } else {
                                    setError('Invalid or expired OTP.');
                                }
                            } catch (err) {
                                setError('Error verifying OTP or updating password.');
                            } finally {
                                setResetLoading(false);
                            }
                        }} 
                        resetOTP={resetOTP} 
                        setResetOTP={setResetOTP} 
                        newPassword={newPassword} 
                        setNewPassword={setNewPassword} 
                        confirmNewPassword={confirmNewPassword} 
                        setConfirmNewPassword={setConfirmNewPassword} 
                        showPassword={showPassword} 
                        setShowPassword={setShowPassword} 
                        setView={setView} 
                        forgotFrom={forgotFrom} 
                    />
                )}
                {(view === 'dashboard' || view.startsWith('admin')) && (
                    <AdminDashboard 
                        setView={setView} 
                        products={products} 
                        orders={orders} 
                        setOrders={setOrders} 
                        selectedDate={selectedDate} 
                        setSelectedDate={setSelectedDate} 
                        selectedDeliveryDate={selectedDeliveryDate} 
                        setSelectedDeliveryDate={setSelectedDeliveryDate} 
                        showRescheduleModal={showRescheduleModal} 
                        setShowRescheduleModal={setShowRescheduleModal} 
                        rescheduleOrder={rescheduleOrder} 
                        setRescheduleOrder={setRescheduleOrder} 
                        proposedDate={proposedDate} 
                        setProposedDate={setProposedDate} 
                        rescheduleReason={rescheduleReason} 
                        setRescheduleReason={setRescheduleReason} 
                        newProduct={newProduct} 
                        setNewProduct={setNewProduct} 
                        handleProductInputChange={handleProductInputChange} 
                        handleAddProduct={handleAddProduct} 
                        productPhotoPreview={productPhotoPreview} 
                        setProductPhotoPreview={setProductPhotoPreview} 
                        productPhotoFile={productPhotoFile} 
                        setProductPhotoFile={setProductPhotoFile} 
                        isUploadingProduct={isUploadingProduct} 
                        handleDeleteProduct={async (id) => {
                            if(window.confirm('Delete this product?')) {
                                await removeProduct(id);
                                setProducts(products.filter(p => p.id !== id));
                            }
                        }} 
                        getOrders={getOrders} 
                        updateOrderStatus={updateOrderStatus} 
                        proposeNewDeliveryDate={proposeNewDeliveryDate} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
"""

new_lines = lines[:return_start]
new_lines.append(new_return_str)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("done")
