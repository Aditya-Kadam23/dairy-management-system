import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { FiLogOut, FiUser } from 'react-icons/fi';

const AdminLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="lg:ml-64 min-h-screen">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                                    Admin Dashboard
                                </h1>
                            </div>

                            <div className="flex items-center space-x-2 sm:space-x-4">
                                {/* User Info */}
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="hidden sm:block text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {user?.role === 'admin' ? 'Administrator' : 'Employee'}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-primary-700" />
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={logout}
                                    className="flex items-center px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FiLogOut className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
