import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdmin, getCustomer, saveCustomer, uploadToS3, getOrdersByEmail, getOrders } from '../aws-config';

export const useAuth = (setView) => {
    const navigate = useNavigate();
    const [customerType, setCustomerType] = useState(() => sessionStorage.getItem('customer_type') || '');

    useEffect(() => {
        if (customerType) {
            sessionStorage.setItem('customer_type', customerType);
        }
    }, [customerType]);
    const [currentUser, setCurrentUser] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('app_user')) || null; } catch { return null; }
    });
    const [error, setError] = useState('');

    useEffect(() => {
        sessionStorage.setItem('app_user', JSON.stringify(currentUser));
    }, [currentUser]);

    const handleAdminLogin = async (e, formData, setOrders) => {
        e.preventDefault();
        setError('');
        if (formData.username && formData.password) {
            const admin = await getAdmin(formData.username);
            if (admin && admin.password === formData.password) {
                setView('dashboard');
                sessionStorage.setItem('is_admin', 'true');
                if (setOrders) {
                    const o = await getOrders();
                    setOrders(o);
                }
                navigate('/admin');
            } else {
                setError(admin ? 'Invalid password' : 'Username not found');
            }
        }
    };

    const handleCustomerLogin = async (e, formData, setMyOrders) => {
        e.preventDefault();
        setError('');
        if (formData.email && formData.password) {
            const customer = await getCustomer(formData.email);
            if (customer && customer.password === formData.password) {
                setCurrentUser(customer);
                if (setMyOrders) {
                    const o = await getOrdersByEmail(customer.email);
                    setMyOrders(o);
                }
                setView('customer-products');
            } else {
                setError(customer ? 'Invalid password' : 'Email not found');
            }
        }
    };

    const handleCustomerRegister = async (e, formData, selectedFiles, activeCustomerType, setMyOrders) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            let shopPictureUrl = '';
            let idProofUrl = '';

            if (activeCustomerType === 'shop-owner') {
                if (selectedFiles?.shopPicture) {
                    shopPictureUrl = await uploadToS3(selectedFiles.shopPicture, 'shop-pictures');
                }
                if (selectedFiles?.idProof) {
                    idProofUrl = await uploadToS3(selectedFiles.idProof, 'verification-docs');
                }
            }

            // Capture the adminId of the store this customer is registering with
            const storeAdminId = sessionStorage.getItem('store_admin_id') || null;

            const success = await saveCustomer({
                ...formData,
                type: activeCustomerType,
                shopPicture: shopPictureUrl || formData.shopPicture,
                idProof: idProofUrl || formData.idProof,
                ...(storeAdminId ? { storeAdminId } : {})
            });

            if (success) {
                setCurrentUser({ ...formData, type: activeCustomerType, storeAdminId });
                if (setMyOrders) {
                    const o = await getOrdersByEmail(formData.email, storeAdminId);
                    setMyOrders(o);
                }
                setView('customer-products');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError('An error occurred during registration.');
        }
    };

    const logout = (setCart) => {
        setCurrentUser(null);
        if (setCart) setCart([]);
        sessionStorage.removeItem('app_user');
        sessionStorage.removeItem('app_cart');
        sessionStorage.removeItem('app_order_details');
        sessionStorage.removeItem('is_admin');
        sessionStorage.removeItem('clerk_mode');
        sessionStorage.removeItem('customer_type');
        sessionStorage.removeItem('store_admin_id');
        sessionStorage.removeItem('page_refreshed');
        sessionStorage.removeItem('last_view');
        sessionStorage.removeItem('app_view');
        sessionStorage.removeItem('was_signed_in');
        setView('landing');
        navigate('/');
    };

    return {
        currentUser, setCurrentUser,
        customerType, setCustomerType,
        error, setError,
        handleAdminLogin, handleCustomerLogin, handleCustomerRegister,
        logout
    };
};
