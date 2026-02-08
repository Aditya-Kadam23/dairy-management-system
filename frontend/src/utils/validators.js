// Validate mobile number (Indian format)
export const validateMobileNumber = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
};

// Validate email
export const validateEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

// Validate required field
export const validateRequired = (value) => {
    return value && value.toString().trim() !== '';
};

// Validate number
export const validateNumber = (value) => {
    return !isNaN(value) && parseFloat(value) >= 0;
};

// Format currency (Indian Rupees)
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Format date for input
export const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Generate WhatsApp link
export const generateWhatsAppLink = (mobileNumber, message = '') => {
    const formattedNumber = mobileNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/91${formattedNumber}${message ? '?text=' + encodedMessage : ''}`;
};
