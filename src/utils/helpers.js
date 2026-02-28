// Sanitize photo URLs to ensure correct path
export const sanitizePhotoUrl = (url) => {
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

// Format currency
export const formatCurrency = (amount) => {
    return `₹${Number(amount).toFixed(0)}`;
};

// Format date
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

// Get order status color
export const getOrderStatusColor = (status) => {
    const colors = {
        'pending': { bg: '#fef3c7', text: '#92400e' },
        'accepted': { bg: '#dcfce7', text: '#166534' },
        'Cancelled by Customer': { bg: '#f3f4f6', text: '#374151' },
        'rejected': { bg: '#fee2e2', text: '#991b1b' },
        'delivered': { bg: '#dcfce7', text: '#166534' }
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151' };
};

// Calculate cart total
export const calculateCartTotal = (cart) => {
    return cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
};

// Calculate cart count
export const calculateCartCount = (cart) => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
};

// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
};

// Validate pincode
export const isValidPincode = (pincode) => {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(pincode);
};
