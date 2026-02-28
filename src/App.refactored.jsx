import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, LogIn, ChevronRight, ArrowLeft, ShieldCheck, Package, IndianRupee, Image as ImageIcon, Trash2, Upload, Mail, ShoppingCart, ListOrdered, Eye, EyeOff, Search } from 'lucide-react';
import { getProducts, saveProduct, removeProduct, getAdmin, getAdminByEmail, updateAdminPassword, saveCustomer, getCustomer, uploadToS3, saveOrder, getOrders, updateOrderStatus, getOrdersByEmail, sendOrderNotification, saveOTP, verifyOTP, sendPasswordResetEmail } from './aws-config';

// Components
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import WelcomeScreen from './components/WelcomeScreen';
import LandingPage from './components/LandingPage';
import VoiceSearch from './components/VoiceSearch';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import RecommendationSection from './components/RecommendationSection';

// Hooks
import { useRecommendations } from './hooks/useRecommendations';

// Utils
import { sanitizePhotoUrl, calculateCartTotal, calculateCartCount } from './utils/helpers';

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // View State
    const [view, setView] = useState(() => sessionStorage.getItem('app_view') || 'welcome');
    const [customerType, setCustomerType] = useState('');
    
    // User State
    const [currentUser, setCurrentUser] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('app_user')) || null; } catch { return null; }
    });
    
    // Products & Cart
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('app_cart')) || []; } catch { return []; }
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    // Orders
    const [orders, setOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [lastOrderId, setLastOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState({ 
        address: '', 
        pincode: '', 
        countryCode: '+91', 
        phone: '', 
        deliveryDate: '', 
        paymentCategory: '', 
        paymentMethod: '' 
    });
    const [orderError, setOrderError] = useState('');
    
    // Admin States
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', photo: '' });
    const [productPhotoFile, setProductPhotoFile] = useState(null);
    const [productPhotoPreview, setProductPhotoPreview] = useState('');
    const [isUploadingProduct, setIsUploadingProduct] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        username: '', password: '', email: '', phone: '', address: '',
        confirmPassword: '', firstName: '', lastName: '', shopPicture: '',
        idType: 'pancard', idProof: ''
    });
    const [selectedFiles, setSelectedFiles] = useState({ shopPicture: null, idProof: null });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Password Reset States
    const [forgotFrom, setForgotFrom] = useState('login');
    const [forgotStage, setForgotStage] = useState('email');
    const [resetEmail, setResetEmail] = useState('');
    const [resetOTP, setResetOTP] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    
    // Recommendations Hook
    const { recentlyViewed, recommendedProducts, addToRecentlyViewed } = useRecommendations(products, cart);
    
    // Persist state to sessionStorage
    useEffect(() => { sessionStorage.setItem('app_view', view); }, [view]);
    useEffect(() => { sessionStorage.setItem('app_user', JSON.stringify(currentUser)); }, [currentUser]);
    useEffect(() => { sessionStorage.setItem('app_cart', JSON.stringify(cart)); }, [cart]);
    
    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            const data = await getProducts();
            const sanitizedData = data.map(p => ({ ...p, photo: sanitizePhotoUrl(p.photo) }));
            setProducts(sanitizedData);
        };
        if (view === 'dashboard' || view === 'customer-products' || location.pathname.startsWith('/admin')) {
            fetchProducts();
        }
    }, [view, location.pathname]);
    
    // Search functionality
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
    
    // Cart Functions
    const cartTotal = calculateCartTotal(cart);
    const cartCount = calculateCartCount(cart);
    
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
    
    // Navigation Functions
    const handleNavigate = (viewName) => {
        setView(viewName);
        if (viewName === 'landing') {
            setCustomerType('');
            navigate('/');
        } else if (viewName === 'my-orders') {
            fetchMyOrders();
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setCart([]);
        sessionStorage.removeItem('app_user');
        sessionStorage.removeItem('app_cart');
        setView('landing');
        navigate('/');
    };
    
    const fetchMyOrders = async () => {
        const o = await getOrdersByEmail(currentUser?.email || '');
        setMyOrders(o);
    };
    
    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };
    
    // Auth Handlers
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.username && formData.password) {
            const admin = await getAdmin(formData.username);
            if (admin && admin.password === formData.password) {
                setView('dashboard');
                sessionStorage.setItem('is_admin', 'true');
                const o = await getOrders();
                setOrders(o);
                navigate('/admin');
            } else {
                setError(admin ? 'Invalid password' : 'Username not found');
            }
        }
    };
    
    const handleCustomerLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.email && formData.password) {
            const customer = await getCustomer(formData.email);
            if (customer && customer.password === formData.password) {
                setCurrentUser(customer);
                const o = await getOrdersByEmail(customer.email);
                setMyOrders(o);
                setView('customer-products');
            } else {
                setError(customer ? 'Invalid password' : 'Email not found');
            }
        }
    };
    
    const handleCustomerRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        try {
            let shopPictureUrl = '';
            let idProofUrl = '';
            
            if (customerType === 'shop-owner') {
                if (selectedFiles.shopPicture) {
                    shopPictureUrl = await uploadToS3(selectedFiles.shopPicture, 'shop-pictures');
                }
                if (selectedFiles.idProof) {
                    idProofUrl = await uploadToS3(selectedFiles.idProof, 'verification-docs');
                }
            }
            
            const success = await saveCustomer({
                ...formData,
                type: customerType,
                shopPicture: shopPictureUrl || formData.shopPicture,
                idProof: idProofUrl || formData.idProof
            });
            
            if (success) {
                setCurrentUser({ ...formData, type: customerType });
                const o = await getOrdersByEmail(formData.email);
                setMyOrders(o);
                setView('customer-products');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError('An error occurred during registration.');
        }
    };
    
    // Product Handlers
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (newProduct.name && newProduct.price) {
            setIsUploadingProduct(true);
            const id = `P${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            let photoUrl = '';
            if (productPhotoFile) {
                photoUrl = await uploadToS3(productPhotoFile, 'product-images');
            }
            const productToAdd = { ...newProduct, id, photo: photoUrl || '' };
            const success = await saveProduct(productToAdd);
            if (success) {
                setProducts(prev => [...prev, productToAdd]);
                setNewProduct({ name: '', price: '', photo: '' });
                setProductPhotoFile(null);
                setProductPhotoPreview('');
            }
            setIsUploadingProduct(false);
        }
    };
    
    const handleDeleteProduct = async (id) => {
        const success = await removeProduct(id);
        if (success) {
            setProducts(products.filter(p => p.id !== id));
        }
    };
    
    // Order Handlers
    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        setOrderError('');
        if (!orderDetails.address.trim()) { setOrderError('Please enter your address.'); return; }
        if (!orderDetails.pincode.trim()) { setOrderError('Please enter your pincode.'); return; }
        if (!orderDetails.phone.trim()) { setOrderError('Please enter your phone number.'); return; }
        if (!orderDetails.deliveryDate) { setOrderError('Please select a delivery date.'); return; }
        if (!orderDetails.paymentCategory) { setOrderError('Please select a payment category.'); return; }
        if (orderDetails.paymentCategory === 'online' && !orderDetails.paymentMethod) { 
            setOrderError('Please select an online payment method.'); 
            return; 
        }
        
        const orderId = await saveOrder({
            customerEmail: currentUser?.email || 'guest',
            customerName: currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : 'Guest',
            items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
            total: cartTotal,
            address: orderDetails.address,
            pincode: orderDetails.pincode,
            phone: `${orderDetails.countryCode}${orderDetails.phone}`,
            deliveryDate: orderDetails.deliveryDate,
            paymentMethod: orderDetails.paymentMethod,
        });
        setLastOrderId(orderId);
        setView('order-confirmed');
    };
    
    const handleCancelOrder = async (order) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                const success = await updateOrderStatus(order.orderId, 'Cancelled by Customer');
                if (success) {
                    await sendOrderNotification(order.customerEmail, 'cancelled', order);
                    const o = await getOrdersByEmail(currentUser?.email || '');
                    setMyOrders(o);
                }
            } catch (err) {
                console.error("Cancellation error:", err);
            }
        }
    };
    
    // Password Reset Handlers
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setResetLoading(true);
        
        try {
            const admin = await getAdminByEmail(resetEmail);
            if (!admin) {
                setError('Email not found. Please enter your registered admin email.');
                setResetLoading(false);
                return;
            }
            
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const saved = await saveOTP(admin.username, otp);
            if (!saved) {
                setError('Failed to generate reset token. Please try again.');
                setResetLoading(false);
                return;
            }
            
            const sent = await sendPasswordResetEmail(resetEmail, otp);
            if (!sent) {
                setError('Failed to send reset email. Please ensure your SES Sender Email is correctly verified in .env');
                setResetLoading(false);
                return;
            }
            
            setForgotStage('otp');
        } catch (err) {
            console.error('Reset error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };
    
    const handleVerifyAndReset = async (e) => {
        e.preventDefault();
        setError('');
        
        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        
        setResetLoading(true);
        
        try {
            const verification = await verifyOTP(resetEmail, resetOTP);
            if (!verification.success) {
                setError(verification.message || 'Invalid or expired OTP.');
                setResetLoading(false);
                return;
            }
            
            const admin = await getAdminByEmail(resetEmail);
            const updated = await updateAdminPassword(admin.username, newPassword);
            if (!updated) {
                setError('Failed to update password. Please try again.');
                setResetLoading(false);
                return;
            }
            
            setForgotStage('success');
        } catch (err) {
            console.error('Verification error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };
    
    return (
        <div className={`app-container ${(view === 'login' || view === 'forgot' || view === 'order-confirmed' || view === 'welcome') ? 'flex-center-all' : ''}`}>
            {(view !== 'welcome' && (view === 'landing' || view.startsWith('customer') || view === 'my-orders')) && (
                <Navbar 
                    currentUser={currentUser} 
                    cartCount={cartCount} 
                    onNavigate={handleNavigate} 
                    onLogout={handleLogout} 
                />
            )}
            
            <AnimatePresence mode="wait">
                {view === 'welcome' && (
                    <WelcomeScreen onGetStarted={() => setView('landing')} />
                )}
                
                {view === 'landing' && (
                    <LandingPage 
                        onSelectCustomerType={(type) => {
                            setCustomerType(type);
                            setView('customer-register');
                        }}
                        onAdminAccess={() => setView('login')}
                    />
                )}
                
                {view === 'customer-products' && (
                    <motion.div
                        key="cust-products"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="dashboard-container"
                        style={{ marginTop: '5rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 className="title" style={{ textAlign: 'center', flex: 1 }}>Featured Products</h2>
                            <VoiceSearch products={products} onAddToCart={addToCart} />
                        </div>
                        
                        <SearchBar 
                            searchQuery={searchQuery} 
                            onSearchChange={setSearchQuery} 
                            resultsCount={filteredProducts.length} 
                        />
                        
                        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        cartQuantity={cart.find(i => i.id === product.id)?.qty || 0}
                                        onAddToCart={(p) => {
                                            addToCart(p);
                                            addToRecentlyViewed(p);
                                        }}
                                        onViewProduct={addToRecentlyViewed}
                                    />
                                ))
                            ) : (
                                <div style={{ 
                                    gridColumn: '1 / -1', 
                                    textAlign: 'center', 
                                    padding: '3rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <Search size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No products found</p>
                                    <p style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>Try searching with different keywords</p>
                                </div>
                            )}
                        </div>
                        
                        {recommendedProducts.length > 0 && recentlyViewed.length > 0 && (
                            <RecommendationSection
                                recommendations={recommendedProducts}
                                cart={cart}
                                onAddToCart={addToCart}
                                onViewProduct={addToRecentlyViewed}
                                title="✨ Recommended For You"
                                layout="grid"
                            />
                        )}
                    </motion.div>
                )}
                
                {/* TODO: Add remaining views here - cart, orders, registration, login, etc. */}
                {/* This is a starting point - you'll need to add the rest of the views */}
            </AnimatePresence>
        </div>
    );
}

export default App;
