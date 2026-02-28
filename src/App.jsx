import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { User, Lock, LogIn, ChevronRight, ArrowLeft, ShieldCheck, Plus, Package, IndianRupee, Image as ImageIcon, Trash2, LayoutDashboard, LogOut, Upload, Mail, ShoppingCart, UserPlus, Home, ListOrdered, Eye, EyeOff, Phone, Search } from 'lucide-react';
import { getProducts, saveProduct, removeProduct, getAdmin, getAdminByEmail, updateAdminPassword, saveCustomer, getCustomer, uploadToS3, saveOrder, getOrders, updateOrderStatus, getOrdersByEmail, sendOrderNotification, saveOTP, verifyOTP, sendPasswordResetEmail } from './aws-config';
import AdminNavbar from './components/AdminNavbar';
import DeliveryCalendar from './components/DeliveryCalendar';

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState(() => sessionStorage.getItem('app_view') || 'welcome');
    const [products, setProducts] = useState([]);
    const [customerType, setCustomerType] = useState('');
    const [currentUser, setCurrentUser] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('app_user')) || null; } catch { return null; }
    });
    const [orders, setOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [lastOrderId, setLastOrderId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [forgotFrom, setForgotFrom] = useState('login'); // 'login' (admin) or 'customer-login'
    const [forgotStage, setForgotStage] = useState('email'); // 'email', 'otp', 'success'
    const [resetEmail, setResetEmail] = useState('');
    const [resetOTP, setResetOTP] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    // Recommendation System States
    const [recentlyViewed, setRecentlyViewed] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        } catch {
            return [];
        }
    });
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    const sanitizePhotoUrl = (url) => {
        if (!url) return url;
        // Don't modify S3 or http URLs – they are already correct
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
            console.log("Fetching products...");
            const data = await getProducts();
            const sanitizedData = data.map(p => ({ ...p, photo: sanitizePhotoUrl(p.photo) }));
            setProducts(sanitizedData);
        };
        if (view === 'dashboard' || view === 'customer-products' || location.pathname.startsWith('/admin')) {
            fetchProducts();
        }
    }, [view, location.pathname]);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phone: '',
        address: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        shopPicture: '',
        idType: 'pancard',
        idProof: ''
    });

    const [selectedFiles, setSelectedFiles] = useState({
        shopPicture: null,
        idProof: null
    });

    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        photo: ''
    });

    const [productPhotoFile, setProductPhotoFile] = useState(null);
    const [productPhotoPreview, setProductPhotoPreview] = useState('');
    const [isUploadingProduct, setIsUploadingProduct] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const [error, setError] = useState('');
    const [recoveryStatus, setRecoveryStatus] = useState('');
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('app_cart')) || []; } catch { return []; }
    });

    // Persist key state to sessionStorage on change
    useEffect(() => { sessionStorage.setItem('app_view', view); }, [view]);
    useEffect(() => { sessionStorage.setItem('app_user', JSON.stringify(currentUser)); }, [currentUser]);
    useEffect(() => { sessionStorage.setItem('app_cart', JSON.stringify(cart)); }, [cart]);

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

    const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // Product Recommendation System
    const addToRecentlyViewed = (product) => {
        setRecentlyViewed(prev => {
            // Remove if already exists
            const filtered = prev.filter(p => p.id !== product.id);
            // Add to beginning, keep only last 10
            const updated = [product, ...filtered].slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));
            return updated;
        });
    };

    const getRecommendations = () => {
        if (products.length === 0) return [];

        let recommendations = [];
        const cartProductIds = cart.map(item => item.id);

        // Define product relationships/categories
        const productRelations = {
            'bread': ['butter', 'jam', 'cream', 'cake'],
            'cake': ['candle', 'cupcake', 'fruit'],
            'cream': ['bread', 'cake', 'fruit'],
            'fruit': ['cake', 'cream']
        };

        // 1. Recommendations based on cart items
        if (cart.length > 0) {
            cart.forEach(cartItem => {
                const itemNameLower = cartItem.name.toLowerCase();
                
                // Find related keywords
                Object.keys(productRelations).forEach(keyword => {
                    if (itemNameLower.includes(keyword)) {
                        const relatedKeywords = productRelations[keyword];
                        
                        // Find products matching related keywords
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

        // 2. Recommendations based on recently viewed
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

        // 3. Fallback: Show random products not in cart
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

    // Update recommendations when cart or products change
    useEffect(() => {
        const recommendations = getRecommendations();
        setRecommendedProducts(recommendations);
    }, [cart, products, recentlyViewed]);

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

    const [orderDetails, setOrderDetails] = useState({ address: '', pincode: '', countryCode: '+91', phone: '', deliveryDate: '', paymentCategory: '', paymentMethod: '' });
    const [orderError, setOrderError] = useState('');

    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        setOrderError('');
        if (!orderDetails.address.trim()) { setOrderError('Please enter your address.'); return; }
        if (!orderDetails.pincode.trim()) { setOrderError('Please enter your pincode.'); return; }
        if (!orderDetails.phone.trim()) { setOrderError('Please enter your phone number.'); return; }
        if (!orderDetails.deliveryDate) { setOrderError('Please select a delivery date.'); return; }
        if (!orderDetails.paymentCategory) { setOrderError('Please select a payment category.'); return; }
        if (orderDetails.paymentCategory === 'online' && !orderDetails.paymentMethod) { setOrderError('Please select an online payment method.'); return; }

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

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setResetLoading(true);

        try {
            // 1. Check if admin exists with this email
            const admin = await getAdminByEmail(resetEmail);
            if (!admin) {
                setError('Email not found. Please enter your registered admin email.');
                setResetLoading(false);
                return;
            }

            // 2. Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // 3. Save OTP to DynamoDB
            const saved = await saveOTP(admin.username, otp);
            if (!saved) {
                setError('Failed to generate reset token. Please try again.');
                setResetLoading(false);
                return;
            }

            // 4. Send Email
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
            // 1. Verify OTP
            const verification = await verifyOTP(resetEmail, resetOTP);
            if (!verification.success) {
                setError(verification.message || 'Invalid or expired OTP.');
                setResetLoading(false);
                return;
            }

            // 2. Get Admin details to find username
            const admin = await getAdminByEmail(resetEmail);

            // 3. Update Password
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

    const renderNavbar = () => {
        if (currentUser && !sessionStorage.getItem('is_admin')) {
            return (
                <nav className="main-nav">
                    <div className="nav-logo pointer" onClick={() => { setView('customer-products'); navigate('/'); }}>
                        <ShoppingCart className="text-accent" size={24} />
                        <span>MyBusiness</span>
                    </div>
                    <div className="nav-links">
                        <button onClick={() => setView('customer-products')} className="nav-link bg-none border-none pointer">Home</button>
                        <button onClick={async () => {
                            const o = await getOrdersByEmail(currentUser?.email || '');
                            setMyOrders(o);
                            setView('my-orders');
                        }} className="nav-link bg-none border-none pointer">My Orders</button>
                        <button onClick={() => setView('contact-us')} className="nav-link bg-none border-none pointer">Contact Us</button>
                        <button onClick={() => setView('cart')} className={`nav-cart-btn flex-center pointer bg-none border-none ${cartCount > 0 ? 'has-items' : ''}`}>
                            <ShoppingCart size={20} />
                            <span className="text-xs">Cart</span>
                            {cartCount > 0 && (
                                <span className="cart-badge">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button onClick={() => {
                            setCurrentUser(null);
                            setCart([]);
                            sessionStorage.removeItem('app_user');
                            sessionStorage.removeItem('app_cart');
                            setView('landing');
                            navigate('/');
                        }} className="nav-link bg-none border-none pointer" style={{ color: '#dc2626' }}>Logout</button>
                    </div>
                </nav>
            );
        }

        return (
            <nav className="main-nav">
                <div className="nav-logo pointer" onClick={() => { setView('landing'); setCustomerType(''); navigate('/'); }}>
                    <ShoppingCart className="text-accent" size={24} />
                    <span>MyBusiness</span>
                </div>
                <div className="nav-links">
                    <button onClick={() => setView('contact-us')} className="nav-link bg-none border-none pointer">Contact Us</button>
                    <button onClick={() => setView('customer-login')} className="nav-link bg-none border-none pointer">Login</button>
                </div>
            </nav>
        );
    };

    return (
        <div className={`app-container ${(view === 'login' || view === 'forgot' || view === 'order-confirmed' || view === 'welcome') ? 'flex-center-all' : ''}`}>
            {(view !== 'welcome' && (view === 'landing' || view.startsWith('customer') || view === 'my-orders')) && renderNavbar()}

            <AnimatePresence mode="wait">
                {view === 'welcome' ? (
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="welcome-screen"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="welcome-logo-box"
                        >
                            <ShoppingCart size={48} />
                        </motion.div>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="welcome-title"
                        >
                            Welcome to MyBusiness
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="welcome-subtitle"
                        >
                            Your one-stop solution for quality goods. Experience a seamless shopping journey today.
                        </motion.p>
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('landing')}
                            className="btn-primary"
                            style={{ padding: '16px 40px', fontSize: '1.25rem' }}
                        >
                            Get Started <ChevronRight size={24} />
                        </motion.button>
                    </motion.div>
                ) : view === 'landing' ? (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="landing-container"
                    >
                        <div className="landing-cards">
                            <motion.div
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
                                whileHover={{ scale: 1.02, y: -5, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)", backgroundColor: "rgba(255, 255, 255, 1)" }}
                                whileTap={{ scale: 0.98 }}
                                className="landing-card landing-card-white"
                            >
                                <div className="card-icon-box">
                                    <ShoppingCart size={32} />
                                </div>
                                <h2 className="card-title">Shop Owners</h2>
                                <p className="card-desc">Register your shop with proper documentation and get access to bulk ordering</p>
                                <div className="card-features">
                                    <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Shop photo required</div>
                                    <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Shop number/registration</div>
                                    <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Shop license document</div>
                                </div>
                                <button onClick={() => { setCustomerType('shop-owner'); setView('customer-register'); }} className="btn-primary">Register as Shop Owner</button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
                                whileHover={{ scale: 1.02, y: -5, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)", backgroundColor: "rgba(255, 255, 255, 1)" }}
                                whileTap={{ scale: 0.98 }}
                                className="landing-card landing-card-white"
                            >
                                <div className="card-icon-box">
                                    <User size={32} />
                                </div>
                                <h2 className="card-title">Regular Customers</h2>
                                <p className="card-desc">Register with your credentials and documents to start shopping</p>
                                <div className="card-features">
                                    <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Phone or email registration</div>
                                    <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> ID proof & photo required</div>
                                    <div className="feature-item"><ShieldCheck size={18} className="feature-icon" /> Quick admin approval</div>
                                </div>
                                <button onClick={() => { setCustomerType('regular'); setView('customer-register'); }} className="btn-primary">Register as Customer</button>
                            </motion.div>
                        </div>
                        <motion.button
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
                            whileHover={{ scale: 1.05, background: "rgba(194, 120, 53, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('login')}
                            className="admin-access-btn mt-4"
                        >
                            Admin Access
                        </motion.button>
                    </motion.div>

                ) : view === 'customer-register' ? (
                    <motion.div
                        key="register"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="customer-reg-container"
                    >
                        <h1 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            {customerType === 'shop-owner' ? 'Register as Shop Owner' : 'Register as Customer'}
                        </h1>
                        <form onSubmit={handleCustomerRegister} className="customer-reg-form">
                            <div className="input-group">
                                <label>First Name</label>
                                <input type="text" name="firstName" className="customer-input" placeholder="First Name" required value={formData.firstName || ''} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" className="customer-input" placeholder="Last Name" required value={formData.lastName || ''} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label>Email Address</label>
                                <input type="email" name="email" className="customer-input" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label>Phone</label>
                                <input type="tel" name="phone" className="customer-input" placeholder="Phone Number" required value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="customer-input"
                                        placeholder="Password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', paddingRight: '45px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className="customer-input"
                                        placeholder="Confirm Password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', paddingRight: '45px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label>Address</label>
                                <textarea name="address" className="customer-input" style={{ width: '100%', padding: '10px' }} placeholder="Full Address" required value={formData.address} onChange={handleInputChange}></textarea>
                            </div>

                            {customerType === 'shop-owner' && (
                                <>
                                    <div className="input-group">
                                        <label style={{ marginBottom: '8px', display: 'block' }}>Shop Front Photo</label>
                                        <input
                                            type="file"
                                            id="shopPictureInput"
                                            accept="image/*"
                                            className="hidden-input"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) setSelectedFiles(prev => ({ ...prev, shopPicture: file }));
                                            }}
                                        />
                                        <label htmlFor="shopPictureInput" className="file-label-btn">
                                            <Upload size={18} />
                                            {selectedFiles.shopPicture ? (
                                                <span style={{ color: 'var(--accent-color)' }}>{selectedFiles.shopPicture.name.length > 25 ? selectedFiles.shopPicture.name.substring(0, 22) + '...' : selectedFiles.shopPicture.name}</span>
                                            ) : 'Choose Shop Photo'}
                                        </label>
                                    </div>
                                    <div className="input-group">
                                        <label>Identity Proof Type</label>
                                        <select name="idType" className="customer-input" value={formData.idType} onChange={handleInputChange}>
                                            <option value="pancard">PAN Card</option>
                                            <option value="adharcard">Aadhar Card</option>
                                            <option value="shoplicence">Shop Licence</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ marginBottom: '8px', display: 'block' }}>Identity Proof Document</label>
                                        <input
                                            type="file"
                                            id="idProofInput"
                                            accept="image/*,.pdf"
                                            className="hidden-input"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) setSelectedFiles(prev => ({ ...prev, idProof: file }));
                                            }}
                                        />
                                        <label htmlFor="idProofInput" className="file-label-btn">
                                            <Upload size={18} />
                                            {selectedFiles.idProof ? (
                                                <span style={{ color: 'var(--accent-color)' }}>{selectedFiles.idProof.name.length > 25 ? selectedFiles.idProof.name.substring(0, 22) + '...' : selectedFiles.idProof.name}</span>
                                            ) : 'Choose Document'}
                                        </label>
                                    </div>
                                </>
                            )}

                            {error && <p className="error-message" style={{ color: 'red', gridColumn: 'span 2', textAlign: 'center' }}>{error}</p>}

                            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '15px', marginTop: '1rem' }}>Complete Registration</button>
                        </form>
                    </motion.div>
                ) : view === 'customer-login' ? (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="customer-reg-container"
                        style={{ maxWidth: '400px' }}
                    >
                        <h1 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Login</h1>
                        <form onSubmit={handleCustomerLogin} className="auth-form" style={{ gap: '1.5rem' }}>
                            {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                            <div className="input-field-wrapper">
                                <label className="label-text">Email Address</label>
                                <input type="email" name="email" className="customer-input" placeholder="enter email" required onChange={handleInputChange} />
                            </div>
                            <div className="input-field-wrapper">
                                <label className="label-text">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="customer-input"
                                        placeholder="password"
                                        required
                                        onChange={handleInputChange}
                                        style={{ width: '100%', paddingRight: '45px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                                <button type="button" onClick={() => { setForgotFrom('customer-login'); setView('forgot'); }} className="link-text" style={{ fontSize: '0.85rem' }}>Forgot Password?</button>
                            </div>
                            <button type="submit" className="btn-primary" style={{ fontSize: '1rem', padding: '14px' }}>Sign In</button>
                            <button type="button" onClick={() => setView('customer-register')} className="link-text mt-4" style={{ color: '#888' }}>Need an account? Register</button>
                            <button type="button" onClick={() => setView('login')} className="link-text mt-4" style={{ color: '#888' }}>Are you an admin? Admin Login</button>
                        </form>
                    </motion.div>
                ) : view === 'customer-products' ? (
                    <motion.div
                        key="cust-products"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="dashboard-container"
                        style={{ marginTop: '5rem' }}
                    >
                        <h2 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Featured Products</h2>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="search-bar-container"
                            style={{
                                marginBottom: '2rem',
                                maxWidth: '600px',
                                margin: '0 auto 2rem'
                            }}
                        >
                            <div style={{
                                position: 'relative',
                                width: '100%'
                            }}>
                                <Search 
                                    size={20} 
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#c27835',
                                        pointerEvents: 'none'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1rem 1rem 3rem',
                                        fontSize: '1rem',
                                        border: '2px solid rgba(194, 120, 53, 0.3)',
                                        borderRadius: '50px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(194, 120, 53, 0.2)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#c27835',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#c27835';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(194, 120, 53, 0.2)';
                                            e.currentTarget.style.color = '#c27835';
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {searchQuery && (
                                <p style={{
                                    marginTop: '0.75rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    textAlign: 'center'
                                }}>
                                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                                </p>
                            )}
                        </motion.div>

                        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <div key={product.id} className="product-item glass-container" style={{ flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                                        <div className="product-img-wrapper" style={{ width: '100%', height: '200px' }}>
                                            {product.photo ? (
                                                <img
                                                    src={product.photo}
                                                    alt={product.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <ImageIcon size={48} className="text-secondary" />
                                            )}
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <h3 className="product-name" style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>{product.name}</h3>
                                            <p className="product-price price-amount" style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>₹{product.price}</p>
                                            <button 
                                                className="btn-primary btn-add-to-cart w-full" 
                                                onClick={() => {
                                                    addToCart(product);
                                                    addToRecentlyViewed(product);
                                                }}
                                            >
                                                {cart.find(i => i.id === product.id) ? `In Cart (${cart.find(i => i.id === product.id).qty})` : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
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

                        {/* Recommendations Section on Products Page */}
                        {recommendedProducts.length > 0 && recentlyViewed.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                style={{ marginTop: '4rem' }}
                            >
                                <h3 style={{ 
                                    fontSize: '1.75rem', 
                                    fontWeight: 700, 
                                    color: 'var(--text-primary)', 
                                    marginBottom: '1.5rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}>
                                    ✨ Recommended For You
                                </h3>
                                
                                <div className="recommendations-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    {recommendedProducts.map(product => (
                                        <motion.div
                                            key={product.id}
                                            whileHover={{ scale: 1.03, y: -8 }}
                                            className="recommendation-card glass-container"
                                            style={{
                                                padding: '1.25rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1rem',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => addToRecentlyViewed(product)}
                                        >
                                            <div style={{ 
                                                width: '100%', 
                                                height: '160px', 
                                                borderRadius: '12px', 
                                                overflow: 'hidden',
                                                background: '#f5eee6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {product.photo ? (
                                                    <img
                                                        src={product.photo}
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={48} style={{ color: '#c27835' }} />
                                                )}
                                            </div>
                                            <div>
                                                <h4 style={{ 
                                                    fontSize: '1.1rem', 
                                                    fontWeight: 600, 
                                                    color: 'var(--text-primary)',
                                                    margin: 0
                                                }}>
                                                    {product.name}
                                                </h4>
                                                <p className="price-amount" style={{ 
                                                    fontSize: '1.3rem', 
                                                    fontWeight: 700,
                                                    margin: '0.5rem 0'
                                                }}>
                                                    ₹{product.price}
                                                </p>
                                            </div>
                                            <button
                                                className="btn-primary"
                                                style={{ 
                                                    fontSize: '0.9rem', 
                                                    padding: '0.7rem 1.2rem',
                                                    width: '100%'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                }}
                                            >
                                                {cart.find(i => i.id === product.id) ? `In Cart (${cart.find(i => i.id === product.id).qty})` : 'Add to Cart'}
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : view === 'cart' ? (
                    <motion.div
                        key="cart"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        className="cart-view"
                        style={{ maxWidth: '680px', margin: '0 auto 2rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                            <button onClick={() => setView('customer-products')} className="bg-none border-none pointer" style={{ color: '#c27835', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <ArrowLeft size={18} /> Back to Products
                            </button>
                        </div>
                        <h2 className="title cart-title-highlight" style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                            🛒 Your Cart {cartCount > 0 && <span style={{ fontSize: '1rem', color: '#c27835' }}>({cartCount} items)</span>}
                        </h2>

                        {cart.length === 0 ? (
                            <div className="glass-container" style={{ textAlign: 'center', padding: '3rem' }}>
                                <ShoppingCart size={56} style={{ color: '#c27835', marginBottom: '1rem', opacity: 0.4 }} />
                                <p style={{ color: '#888', fontSize: '1.1rem' }}>Your cart is empty</p>
                                <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setView('customer-products')}>
                                    Browse Products
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {cart.map(item => (
                                    <div key={item.id} className="glass-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                                        <div style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f5eee6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.photo ? (
                                                <img src={item.photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            ) : (
                                                <ImageIcon size={28} style={{ color: '#c27835' }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{item.name}</p>
                                            <p className="price-tag" style={{ margin: '4px 0 0' }}>₹{item.price} each</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <button onClick={() => updateQty(item.id, -1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #c27835', background: 'white', color: '#c27835', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                            <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '24px', textAlign: 'center', color: 'var(--text-primary)' }}>{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #c27835', background: '#c27835', color: 'white', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: '70px' }}>
                                            <p className="price-tag" style={{ margin: 0 }}>₹{(Number(item.price) * item.qty).toFixed(0)}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="delete-btn"><Trash2 size={16} /></button>
                                    </div>
                                ))}

                                {/* Order Total */}
                                <div className="glass-container" style={{ padding: '20px 24px', marginTop: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
                                        <span>Total</span>
                                        <span className="total-highlight">₹{cartTotal.toFixed(0)}</span>
                                    </div>
                                    <button className="btn-primary w-full" style={{ marginTop: '16px', background: '#c27835', fontSize: '1rem', padding: '14px' }} onClick={() => setView('order-address')}>
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Recommendations Section */}
                        {recommendedProducts.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{ marginTop: '3rem' }}
                            >
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 700, 
                                    color: 'var(--text-primary)', 
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    ✨ You May Also Like
                                </h3>
                                
                                <div className="recommendations-scroll" style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    overflowX: 'auto',
                                    paddingBottom: '1rem',
                                    scrollBehavior: 'smooth'
                                }}>
                                    {recommendedProducts.map(product => (
                                        <motion.div
                                            key={product.id}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            className="recommendation-card glass-container"
                                            style={{
                                                minWidth: '200px',
                                                maxWidth: '200px',
                                                padding: '1rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.75rem',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => addToRecentlyViewed(product)}
                                        >
                                            <div style={{ 
                                                width: '100%', 
                                                height: '140px', 
                                                borderRadius: '12px', 
                                                overflow: 'hidden',
                                                background: '#f5eee6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {product.photo ? (
                                                    <img
                                                        src={product.photo}
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={40} style={{ color: '#c27835' }} />
                                                )}
                                            </div>
                                            <div>
                                                <h4 style={{ 
                                                    fontSize: '0.95rem', 
                                                    fontWeight: 600, 
                                                    color: 'var(--text-primary)',
                                                    margin: 0,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {product.name}
                                                </h4>
                                                <p className="price-tag" style={{ 
                                                    fontSize: '1.1rem', 
                                                    fontWeight: 700,
                                                    margin: '0.25rem 0'
                                                }}>
                                                    ₹{product.price}
                                                </p>
                                            </div>
                                            <button
                                                className="btn-primary"
                                                style={{ 
                                                    fontSize: '0.85rem', 
                                                    padding: '0.6rem 1rem',
                                                    width: '100%'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                }}
                                            >
                                                Add to Cart
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : view === 'order-address' ? (
                    <motion.div
                        key="order-address"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        className="order-view"
                        style={{ maxWidth: '560px', margin: '0 auto 2rem' }}
                    >
                        <div style={{ marginBottom: '1.5rem' }}>
                            <button onClick={() => setView('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <ArrowLeft size={18} /> Back to Cart
                            </button>
                        </div>
                        <h2 className="title" style={{ color: '#f59e0b', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>📦 Delivery Details</h2>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>Fill in your delivery information to complete the order.</p>

                        <form onSubmit={handleConfirmOrder} style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                            {orderError && (
                                <div style={{ background: '#fff3f3', border: '1px solid #ffa0a0', borderRadius: '8px', padding: '10px 14px', color: '#cc0000', fontSize: '0.9rem' }}>
                                    ⚠️ {orderError}
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Delivery Address *</label>
                                <textarea
                                    rows={3}
                                    placeholder="Enter your full delivery address…"
                                    className="input-field"
                                    style={{ resize: 'vertical', fontFamily: 'inherit', color: '#2d1e12', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 16px' }}
                                    value={orderDetails.address}
                                    onChange={(e) => setOrderDetails(prev => ({ ...prev, address: e.target.value }))}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Pincode *</label>
                                <input
                                    type="text"
                                    placeholder="Enter your 6-digit pincode"
                                    className="input-field"
                                    style={{ color: '#2d1e12', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 16px' }}
                                    value={orderDetails.pincode}
                                    onChange={(e) => setOrderDetails(prev => ({ ...prev, pincode: e.target.value }))}
                                    pattern="[0-9]{6}"
                                    maxLength="6"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Phone Number *</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select
                                        className="input-field"
                                        style={{ color: '#2d1e12', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 8px', width: '100px', flexShrink: 0 }}
                                        value={orderDetails.countryCode}
                                        onChange={(e) => setOrderDetails(prev => ({ ...prev, countryCode: e.target.value }))}
                                    >
                                        <option value="+91">+91 (IN)</option>
                                        <option value="+1">+1 (US)</option>
                                        <option value="+44">+44 (UK)</option>
                                        <option value="+971">+971 (UAE)</option>
                                        <option value="+61">+61 (AU)</option>
                                    </select>
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        className="input-field light-input"
                                        style={{ color: '#2d1e12', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 16px', flexGrow: 1 }}
                                        value={orderDetails.phone}
                                        onChange={(e) => setOrderDetails(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                                        pattern="[0-9]{10}"
                                        maxLength="10"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Preferred Delivery Date *</label>
                                <input
                                    type="date"
                                    className="input-field light-input"
                                    style={{ color: '#2d1e12', colorScheme: 'light', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px 16px' }}
                                    min={new Date().toISOString().split('T')[0]}
                                    value={orderDetails.deliveryDate}
                                    onChange={(e) => setOrderDetails(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                    required
                                />
                            </div>

                            {/* Payment Method */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontWeight: 600, color: '#2d1e12', fontSize: '0.9rem' }}>Payment Method *</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setOrderDetails(prev => ({ ...prev, paymentCategory: 'cod', paymentMethod: 'cod' }))}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '14px', borderRadius: '12px', cursor: 'pointer',
                                            border: orderDetails.paymentCategory === 'cod' ? '2px solid #c27835' : '1.5px solid #ddd',
                                            background: orderDetails.paymentCategory === 'cod' ? 'rgba(194, 120, 53, 0.1)' : '#ffffff',
                                            fontWeight: 700, fontSize: '0.95rem', color: '#2d1e12',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.4rem' }}>💵</span>
                                        Cash on Delivery
                                        {orderDetails.paymentCategory === 'cod' && <span style={{ marginLeft: 'auto', color: '#c27835' }}>✓</span>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrderDetails(prev => ({ ...prev, paymentCategory: 'online', paymentMethod: '' }))}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '14px', borderRadius: '12px', cursor: 'pointer',
                                            border: orderDetails.paymentCategory === 'online' ? '2px solid #c27835' : '1.5px solid #ddd',
                                            background: orderDetails.paymentCategory === 'online' ? 'rgba(194, 120, 53, 0.1)' : '#ffffff',
                                            fontWeight: 700, fontSize: '0.95rem', color: '#2d1e12',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.4rem' }}>💳</span>
                                        Online Payment
                                        {orderDetails.paymentCategory === 'online' && <span style={{ marginLeft: 'auto', color: '#c27835' }}>✓</span>}
                                    </button>
                                </div>

                                {orderDetails.paymentCategory === 'online' && (
                                    <div style={{
                                        marginTop: '5px',
                                        padding: '16px',
                                        background: '#f9f9f9',
                                        borderRadius: '12px',
                                        border: '1px dashed #c27835',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        animation: 'fadeIn 0.3s ease'
                                    }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666', margin: 0 }}>Select Online Method:</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            {[
                                                { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                                                { id: 'gpay', label: 'Google Pay', icon: '🔵' },
                                                { id: 'paytm', label: 'Paytm', icon: '🔷' },
                                                { id: 'upi', label: 'UPI', icon: '🆔' },
                                            ].map(method => (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => setOrderDetails(prev => ({ ...prev, paymentMethod: method.id }))}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '10px',
                                                        padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                                                        border: orderDetails.paymentMethod === method.id ? '2px solid #c27835' : '1px solid #ddd',
                                                        background: orderDetails.paymentMethod === method.id ? 'rgba(194, 120, 53, 0.1)' : '#ffffff',
                                                        fontWeight: 600, fontSize: '0.88rem', color: '#2d1e12',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.2rem' }}>{method.icon}</span>
                                                    {method.label}
                                                    {orderDetails.paymentMethod === method.id && <span style={{ marginLeft: 'auto', color: '#c27835' }}>✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ background: 'rgba(194, 120, 53, 0.1)', borderRadius: '10px', padding: '14px 16px', marginTop: '0.5rem' }}>
                                <p style={{ fontWeight: 700, color: '#2d1e12', margin: '0 0 6px', fontSize: '0.95rem' }}>Order Summary</p>
                                {cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.88rem', padding: '2px 0' }}>
                                        <span>{item.name} × {item.qty}</span>
                                        <span>₹{(Number(item.price) * item.qty).toFixed(0)}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid rgba(194,120,53,0.2)', marginTop: '8px', paddingTop: '8px', color: '#c27835' }}>
                                    <span style={{ color: '#2d1e12' }}>Total</span>
                                    <span>₹{cartTotal.toFixed(0)}</span>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full" style={{ fontSize: '1rem', padding: '14px', marginTop: '0.5rem' }}>
                                Confirm Order ✓
                            </button>
                        </form>
                    </motion.div>
                ) : view === 'my-orders' ? (
                    <motion.div
                        key="my-orders"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="order-view"
                        style={{ maxWidth: '800px', margin: '0 auto 2rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <button onClick={() => setView('customer-products')} className="bg-none border-none pointer" style={{ color: '#c27835', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <ArrowLeft size={18} /> Back to Products
                            </button>
                            <button onClick={async () => {
                                const o = await getOrdersByEmail(currentUser?.email || '');
                                setMyOrders(o);
                            }} style={{ background: 'none', border: 'none', color: '#c27835', cursor: 'pointer', fontWeight: 600 }}>↻ Refresh</button>
                        </div>

                        <h2 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', borderBottom: '3px solid #c27835', paddingBottom: '10px' }}>My Orders</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {myOrders.length === 0 ? (
                                <div className="glass-container" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <ListOrdered size={48} style={{ color: '#c27835', marginBottom: '1rem', opacity: 0.3 }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
                                    <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setView('customer-products')}>
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                myOrders.map(order => (
                                    <div key={order.orderId} className="glass-container" style={{ padding: '20px', borderLeft: `5px solid ${order.status === 'pending' ? '#f59e0b' : order.status === 'accepted' ? '#22c55e' : order.status === 'Cancelled by Customer' ? '#6b7280' : '#ef4444'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                    <span className="order-id-highlight" style={{ fontSize: '0.9rem' }}>{order.orderId}</span>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        background: order.status === 'pending' ? '#fef3c7' : order.status === 'accepted' ? '#dcfce7' : order.status === 'Cancelled by Customer' ? '#f3f4f6' : '#fee2e2',
                                                        color: order.status === 'pending' ? '#92400e' : order.status === 'accepted' ? '#166534' : order.status === 'Cancelled by Customer' ? '#374151' : '#991b1b'
                                                    }}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Deliver to: {order.address}</p>
                                                <div style={{ marginTop: '12px' }}>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Items:</p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                        {order.items?.map(i => `${i.name} (${i.qty})`).join(', ')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>Total Amount</p>
                                                <p className="total-highlight" style={{ fontSize: '1.4rem', margin: 0 }}>₹{order.total}</p>
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order)}
                                                        style={{
                                                            marginTop: '12px',
                                                            background: 'none',
                                                            border: '1.5px solid #dc2626',
                                                            color: '#dc2626',
                                                            borderRadius: '8px',
                                                            padding: '6px 14px',
                                                            cursor: 'pointer',
                                                            fontWeight: 700,
                                                            fontSize: '0.8rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        Cancel Order
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                ) : view === 'order-confirmed' ? (
                    <motion.div
                        key="order-confirmed"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-container auth-card"
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Order Placed!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Delivering to: <strong>{orderDetails.address}</strong></p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Expected by: <strong>{orderDetails.deliveryDate}</strong></p>
                        {lastOrderId && <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Order ID: <span className="order-id-highlight">{lastOrderId}</span></p>}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn-primary" onClick={() => { setCart([]); setOrderDetails({ address: '', phone: '', deliveryDate: '' }); setView('customer-products'); }}>
                                Continue Shopping
                            </button>
                        </div>
                    </motion.div>
                ) : view === 'contact-us' ? (
                    <motion.div
                        key="contact"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="customer-reg-container"
                        style={{ maxWidth: '500px', textAlign: 'center', background: '#fff', color: '#000' }}
                    >
                        <h1 className="title" style={{ color: '#000', marginBottom: '1.5rem', fontWeight: 800 }}>Customer Support</h1>
                        <p style={{ color: '#333', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                            For any assistance or queries, please reach out to us directly:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</p>
                                <a href="mailto:rsunkara03@gmail.com" style={{ display: 'block', margin: '8px 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>
                                    rsunkara03@gmail.com
                                </a>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Number</p>
                                <a href="tel:+919849924480" style={{ display: 'block', margin: '8px 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>
                                    +91 9849924480
                                </a>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: "#333", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('landing')}
                            className="btn-primary"
                            style={{
                                marginTop: '3rem',
                                padding: '14px 50px',
                                background: '#000',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Back to Home
                        </motion.button>
                    </motion.div>
                ) : view === 'login' ? (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="glass-container auth-card"
                    >
                        <div className="header-section">
                            <div className="logo-box">
                                <ShieldCheck size={32} className="logo-icon" color="var(--accent-color)" />
                            </div>
                            <h1 className="title">Admin Portal</h1>
                            <p className="subtitle">Secure access to your dashboard</p>
                        </div>

                        <form onSubmit={handleAdminLogin} className="auth-form">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="error-message"
                                    style={{ color: '#ff4d4f', textAlign: 'center', fontSize: '14px' }}
                                >
                                    {error}
                                </motion.div>
                            )}
                            <div className="input-group">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    className="input-field"
                                    required
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="input-group">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    className="input-field"
                                    required
                                    onChange={handleInputChange}
                                    style={{ paddingRight: '45px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="form-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button type="button" onClick={() => { setForgotFrom('login'); setView('forgot'); }} className="link-text" style={{ fontSize: '0.85rem' }}>Forgot Password?</button>
                                <button type="button" onClick={() => setView('landing')} className="link-text">Customer Portal</button>
                            </div>

                            <button type="submit" className="btn-primary w-full flex-center">
                                Sign In <LogIn size={18} />
                            </button>
                        </form>
                    </motion.div>
                ) : view === 'forgot' ? (
                    <motion.div
                        key="forgot"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-container auth-card"
                        style={{ maxWidth: '400px' }}
                    >
                        {forgotStage === 'email' && (
                            <>
                                <div className="header-section">
                                    <div className="logo-box">
                                        <Mail size={32} className="logo-icon" color="var(--accent-color)" />
                                    </div>
                                    <h1 className="title">Reset Password</h1>
                                    <p className="subtitle">Enter your email to receive a reset OTP.</p>
                                </div>
                                <form onSubmit={handleSendOTP} className="auth-form">
                                    {error && <p className="error-message" style={{ color: '#ff4d4f', textAlign: 'center' }}>{error}</p>}
                                    <div className="input-group">
                                        <Mail size={18} className="input-icon" />
                                        <input
                                            type="email"
                                            placeholder="Admin Email"
                                            className="input-field"
                                            required
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary w-full flex-center" disabled={resetLoading}>
                                        {resetLoading ? 'Sending...' : 'Send OTP'} <ChevronRight size={18} />
                                    </button>
                                    <button type="button" onClick={() => setView(forgotFrom)} className="link-text w-full mt-4">Back to Login</button>
                                </form>
                            </>
                        )}

                        {forgotStage === 'otp' && (
                            <>
                                <div className="header-section">
                                    <div className="logo-box">
                                        <ShieldCheck size={32} className="logo-icon" color="var(--accent-color)" />
                                    </div>
                                    <h1 className="title">Verify OTP</h1>
                                    <p className="subtitle">Sent to: <strong>{resetEmail}</strong></p>
                                </div>
                                <form onSubmit={handleVerifyAndReset} className="auth-form">
                                    {error && <p className="error-message" style={{ color: '#ff4d4f', textAlign: 'center' }}>{error}</p>}
                                    <div className="input-group">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            className="input-field"
                                            required
                                            maxLength={6}
                                            value={resetOTP}
                                            onChange={(e) => setResetOTP(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="New Password"
                                            className="input-field"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ paddingRight: '45px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div className="input-group">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm New Password"
                                            className="input-field"
                                            required
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            style={{ paddingRight: '45px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c27835', display: 'flex' }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <button type="submit" className="btn-primary w-full flex-center" disabled={resetLoading}>
                                        {resetLoading ? 'Verifying...' : 'Reset Password'} <ShieldCheck size={18} />
                                    </button>
                                    <button type="button" onClick={() => setForgotStage('email')} className="link-text w-full mt-4">Change Email</button>
                                </form>
                            </>
                        )}

                        {forgotStage === 'success' && (
                            <div style={{ textAlign: 'center' }}>
                                <div className="header-section">
                                    <div className="logo-box" style={{ background: '#f6ffed', border: 'none' }}>
                                        <ShieldCheck size={32} color="#52c41a" />
                                    </div>
                                    <h1 className="title">Reset Successful</h1>
                                    <p className="subtitle">Password reset successful. Please log in with your new password.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setForgotStage('email');
                                        setResetEmail('');
                                        setResetOTP('');
                                        setNewPassword('');
                                        setConfirmNewPassword('');
                                        setView(forgotFrom);
                                    }}
                                    className="btn-primary w-full"
                                >
                                    Log In Now
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="admin-layout"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="dashboard-container"
                    >
                        <AdminNavbar onLogout={() => {
                            sessionStorage.removeItem('is_admin');
                            setView('login');
                            navigate('/');
                        }} />

                        <Routes>
                            <Route path="/admin" element={
                                <>
                                    {/* Dashboard Overview */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
                                            Dashboard Overview
                                        </h2>

                                        {/* Summary Cards */}
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                                            gap: '1.5rem',
                                            marginBottom: '3rem'
                                        }}>
                                            {/* Total Products Card */}
                                            <motion.div
                                                whileHover={{ scale: 1.03, y: -5 }}
                                                className="glass-container"
                                                style={{
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, rgba(194, 120, 53, 0.1), rgba(194, 120, 53, 0.05))',
                                                    border: '1.5px solid rgba(194, 120, 53, 0.3)',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => navigate('/admin/products')}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #c27835, #d97706)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 4px 15px rgba(194, 120, 53, 0.3)'
                                                    }}>
                                                        <Package size={24} color="white" />
                                                    </div>
                                                    <ChevronRight size={20} color="var(--accent-color)" />
                                                </div>
                                                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                                                    {products.length}
                                                </h3>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                                                    Total Products
                                                </p>
                                            </motion.div>

                                            {/* Total Orders Card */}
                                            <motion.div
                                                whileHover={{ scale: 1.03, y: -5 }}
                                                className="glass-container"
                                                style={{
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
                                                    border: '1.5px solid rgba(59, 130, 246, 0.3)',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => navigate('/admin/orders')}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                                                    }}>
                                                        <ShoppingCart size={24} color="white" />
                                                    </div>
                                                    <ChevronRight size={20} color="#3b82f6" />
                                                </div>
                                                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                                                    {orders.length}
                                                </h3>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                                                    Total Orders
                                                </p>
                                                {orders.filter(o => o.status === 'pending').length > 0 && (
                                                    <div style={{
                                                        marginTop: '0.5rem',
                                                        padding: '0.25rem 0.75rem',
                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        color: '#ef4444',
                                                        fontWeight: 600,
                                                        display: 'inline-block'
                                                    }}>
                                                        {orders.filter(o => o.status === 'pending').length} Pending
                                                    </div>
                                                )}
                                            </motion.div>

                                            {/* Total Customers Card */}
                                            <motion.div
                                                whileHover={{ scale: 1.03, y: -5 }}
                                                className="glass-container"
                                                style={{
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))',
                                                    border: '1.5px solid rgba(168, 85, 247, 0.3)',
                                                    cursor: 'default'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
                                                    }}>
                                                        <User size={24} color="white" />
                                                    </div>
                                                </div>
                                                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                                                    {new Set(orders.map(o => o.customerEmail)).size}
                                                </h3>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                                                    Total Customers
                                                </p>
                                            </motion.div>
                                        </div>

                                        {/* Recent Orders Section */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="glass-container"
                                            style={{ padding: '2rem', marginBottom: '2rem' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                                    Recent Orders
                                                </h3>
                                                <button
                                                    onClick={() => navigate('/admin/orders')}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--accent-color)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    View All <ChevronRight size={16} />
                                                </button>
                                            </div>
                                            {orders.slice(0, 5).map(order => (
                                                <div key={order.orderId} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '1rem',
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    borderRadius: '12px',
                                                    marginBottom: '0.75rem',
                                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                                }}>
                                                    <div>
                                                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{order.orderId}</p>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                                                            {order.customerEmail}
                                                        </p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ fontWeight: 700, color: 'var(--accent-color)', margin: 0 }}>₹{order.total}</p>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '12px',
                                                            background: order.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                            color: order.status === 'pending' ? '#ef4444' : '#10b981',
                                                            fontWeight: 600,
                                                            display: 'inline-block',
                                                            marginTop: '0.25rem'
                                                        }}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </motion.div>
                                </>
                            } />

                            <Route path="/admin/products" element={
                                <section className="dashboard-section glass-container">
                                    <div className="section-header">
                                        <Package className="text-accent" size={20} />
                                        <h3>Product Availability</h3>
                                    </div>
                                    <div className="product-list">
                                        {products.map(product => (
                                            <div key={product.id} className="product-item" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', marginBottom: '8px' }}>
                                                <div style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {product.photo ? (
                                                        <img
                                                            src={product.photo}
                                                            alt={product.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <ImageIcon size={28} className="text-secondary" />
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p className="product-name" style={{ margin: 0, fontSize: '1rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
                                                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>ID: {product.id}</p>
                                                    <p className="product-price" style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--accent-color)' }}>₹{product.price}</p>
                                                </div>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn" style={{ flexShrink: 0 }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            } />

                            <Route path="/admin/orders" element={
                                <section className="dashboard-section glass-container">
                                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Package className="text-accent" size={20} />
                                            <h3>Orders {orders.filter(o => o.status === 'pending').length > 0 && <span style={{ background: '#c27835', color: 'white', borderRadius: '12px', padding: '2px 10px', fontSize: '0.8rem', marginLeft: '8px' }}>{orders.filter(o => o.status === 'pending').length} pending</span>}</h3>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '10px', border: '1px solid rgba(194, 120, 53, 0.3)' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter by Date:</span>
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="bg-none border-none"
                                                    style={{
                                                        color: 'var(--text-primary)',
                                                        colorScheme: 'dark',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                {selectedDate && (
                                                    <button
                                                        onClick={() => setSelectedDate('')}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                            <button onClick={async () => { const o = await getOrders(); setOrders(o); }} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>↻ Refresh</button>
                                        </div>
                                    </div>
                                    {orders.filter(order => !selectedDate || order.createdAt.startsWith(selectedDate)).length === 0 ? (
                                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1.5rem' }}>
                                            {selectedDate ? `No orders found for ${selectedDate}.` : 'No orders yet.'}
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {orders
                                                .filter(order => !selectedDate || order.createdAt.startsWith(selectedDate))
                                                .map(order => (
                                                    <div key={order.orderId} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px 16px', border: `1px solid ${order.status === 'pending' ? 'rgba(194,120,53,0.4)' : order.status === 'accepted' ? 'rgba(34,197,94,0.3)' : order.status === 'Cancelled by Customer' ? 'rgba(107, 114, 128, 0.4)' : 'rgba(239,68,68,0.3)'}` }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                                            <div>
                                                                <p className="order-id-highlight" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{order.orderId}</p>
                                                                <p style={{ margin: '2px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From: {order.customerEmail} | Phone: {order.phone} | Deliver by: {order.deliveryDate}</p>
                                                                <p style={{ margin: '2px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Address: {order.address}</p>
                                                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{order.items?.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
                                                                <p className="price-amount" style={{ margin: '4px 0 0', fontSize: '1.1rem' }}>Total: ₹{order.total}</p>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: order.status === 'pending' ? 'rgba(194,120,53,0.2)' : order.status === 'accepted' ? 'rgba(34,197,94,0.2)' : order.status === 'Cancelled by Customer' ? 'rgba(107, 114, 128, 0.2)' : 'rgba(239,68,68,0.2)', color: order.status === 'pending' ? '#c27835' : order.status === 'accepted' ? '#16a34a' : order.status === 'Cancelled by Customer' ? '#6b7280' : '#dc2626' }}>
                                                                    {order.status.toUpperCase()}
                                                                </span>
                                                                {order.status === 'pending' && (
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <button onClick={async () => {
                                                                            await updateOrderStatus(order.orderId, 'accepted');
                                                                            await sendOrderNotification(order.customerEmail, 'accepted', order);
                                                                            const o = await getOrders(); setOrders(o);
                                                                        }} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>✓ Accept</button>
                                                                        <button onClick={async () => {
                                                                            await updateOrderStatus(order.orderId, 'cancelled');
                                                                            await sendOrderNotification(order.customerEmail, 'cancelled', order);
                                                                            const o = await getOrders(); setOrders(o);
                                                                        }} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>✗ Cancel</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    <div style={{ marginTop: '20px' }}>
                                        <DeliveryCalendar
                                            orders={orders}
                                            onDateClick={(date) => setSelectedDeliveryDate(date)}
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {selectedDeliveryDate && (
                                            <div className="modal-overlay" onClick={() => setSelectedDeliveryDate(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="glass-container"
                                                    style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', padding: '24px', position: 'relative' }}
                                                >
                                                    <button
                                                        onClick={() => setSelectedDeliveryDate(null)}
                                                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                                                    >✕</button>
                                                    <h3 style={{ borderBottom: '2px solid var(--accent-color)', paddingBottom: '10px', marginBottom: '20px' }}>
                                                        Deliveries for {new Date(selectedDeliveryDate).toLocaleDateString()}
                                                    </h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        {orders.filter(o => o.deliveryDate === selectedDeliveryDate).length > 0 ? (
                                                            orders.filter(o => o.deliveryDate === selectedDeliveryDate).map(order => (
                                                                <div key={order.orderId} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                                        <span className="order-id-highlight" style={{ fontSize: '0.9rem' }}>{order.orderId}</span>
                                                                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: order.status === 'confirmed' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)', color: order.status === 'confirmed' ? '#81c784' : '#ffb74d' }}>
                                                                            {order.status}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ background: 'rgba(194, 120, 53, 0.1)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid var(--accent-color)' }}>
                                                                        <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0, color: 'var(--accent-color)' }}>{order.customerName}</p>
                                                                        <p style={{ fontSize: '0.85rem', color: '#888', margin: '2px 0 0' }}>Phone: {order.phone}</p>
                                                                    </div>
                                                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginBottom: '10px' }}>
                                                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 5px' }}>Products:</p>
                                                                        {order.items?.map((item, idx) => (
                                                                            <p key={idx} style={{ fontSize: '0.85rem', color: '#ccc', margin: '0 0 2px' }}>• {item.name} ×{item.qty}</p>
                                                                        ))}
                                                                    </div>
                                                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                                                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 5px' }}>Delivery Address:</p>
                                                                        <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>{order.address}</p>
                                                                    </div>
                                                                    <p style={{ marginTop: '15px', textAlign: 'right', color: 'var(--accent-color)', fontWeight: 700 }}>Total: ₹{order.total}</p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p style={{ textAlign: 'center', color: '#888' }}>No deliveries scheduled for this day.</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </section>
                            } />

                            <Route path="/admin/add-product" element={
                                <section className="dashboard-section glass-container admin-white-section">
                                    <form onSubmit={handleAddProduct} className="dashboard-form">
                                        <h3>Add New Product</h3>
                                        <input name="name" placeholder="Product Name" className="input-field" required value={newProduct.name} onChange={handleProductInputChange} />
                                        <div className="input-group">
                                            <IndianRupee className="input-icon" size={18} style={{ color: 'var(--accent-color)' }} />
                                            <input name="price" placeholder="Price" className="input-field" required value={newProduct.price} onChange={handleProductInputChange} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                            <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <ImageIcon size={16} /> Product Photo
                                            </label>
                                            {productPhotoPreview && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(194, 120, 53, 0.3)', background: 'rgba(0,0,0,0.2)' }}
                                                >
                                                    <img src={productPhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </motion.div>
                                            )}
                                            <input
                                                type="file"
                                                id="productPhotoInput"
                                                accept="image/*"
                                                className="hidden-input"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setProductPhotoFile(file);
                                                        setProductPhotoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                            <label htmlFor="productPhotoInput" className="file-label-btn">
                                                <Upload size={18} />
                                                {productPhotoFile ? (
                                                    <span style={{ color: 'var(--accent-color)' }}>{productPhotoFile.name.length > 25 ? productPhotoFile.name.substring(0, 22) + '...' : productPhotoFile.name}</span>
                                                ) : 'Choose Product Image'}
                                            </label>
                                        </div>
                                        <button type="submit" className="btn-primary w-full" disabled={isUploadingProduct}>
                                            {isUploadingProduct ? 'Uploading...' : 'Add Product'}
                                        </button>
                                    </form>
                                </section>
                            } />

                            <Route path="*" element={<Navigate to="/admin" replace />} />
                        </Routes>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </div >
    );
}

export default App;
