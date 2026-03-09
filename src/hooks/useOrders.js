import { useState, useEffect } from 'react';
import { saveOrder, updateOrderStatus, getOrdersByEmail, sendOrderNotification } from '../aws-config';

export const useOrders = (currentUser, cart, cartTotal, setView, adminId) => {
    const [orders, setOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [lastOrderId, setLastOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState(() => {
        // Try to restore order details from sessionStorage on page refresh
        try {
            const saved = sessionStorage.getItem('app_order_details');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error restoring order details:', error);
        }
        return { 
            address: '', pincode: '', countryCode: '+91', phone: '', deliveryDate: '', paymentCategory: '', paymentMethod: '' 
        };
    });
    const [orderError, setOrderError] = useState('');

    // Persist order details to sessionStorage whenever they change
    useEffect(() => {
        if (orderDetails && Object.keys(orderDetails).length > 0) {
            sessionStorage.setItem('app_order_details', JSON.stringify(orderDetails));
        }
    }, [orderDetails]);

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
        }, adminId);
        
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

    return {
        orders, setOrders,
        myOrders, setMyOrders,
        lastOrderId, setLastOrderId,
        orderDetails, setOrderDetails,
        orderError, setOrderError,
        handleConfirmOrder, handleCancelOrder
    };
};
