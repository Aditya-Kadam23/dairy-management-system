import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
                <div className={`relative bg-white rounded-lg sm:rounded-xl shadow-xl ${sizes[size]} w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                            aria-label="Close modal"
                        >
                            <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
