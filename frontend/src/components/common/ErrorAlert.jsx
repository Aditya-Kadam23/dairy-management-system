import React from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const ErrorAlert = ({ message, type = 'error', onClose }) => {
    const types = {
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: <FiAlertCircle className="w-5 h-5 text-red-600" />
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: <FiCheckCircle className="w-5 h-5 text-green-600" />
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: <FiInfo className="w-5 h-5 text-blue-600" />
        }
    };

    const style = types[type] || types.error;

    if (!message) return null;

    return (
        <div className={`${style.bg} ${style.border} border rounded-lg p-4 mb-4 flex items-start`}>
            <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
            <div className={`ml-3 flex-1 ${style.text}`}>
                <p className="text-sm font-medium">{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 ml-auto focus:outline-none"
                >
                    <FiX className={`w-5 h-5 ${style.text}`} />
                </button>
            )}
        </div>
    );
};

export default ErrorAlert;
