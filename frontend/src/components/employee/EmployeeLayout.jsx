import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogOut, FiUser, FiCheckSquare, FiUsers } from 'react-icons/fi';

const EmployeeLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Mobile Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <FiUser className="w-5 h-5 text-primary-700" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">Employee</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <FiLogOut className="w-4 h-4 mr-1" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="px-4 pb-3">
                    <div className="flex space-x-2">
                        <NavLink
                            to="/employee/deliveries"
                            className={({ isActive }) =>
                                `flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            <FiCheckSquare className="w-4 h-4 mr-2" />
                            Deliveries
                        </NavLink>
                        <NavLink
                            to="/employee/assignments"
                            className={({ isActive }) =>
                                `flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            <FiUsers className="w-4 h-4 mr-2" />
                            My Customers
                        </NavLink>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default EmployeeLayout;
