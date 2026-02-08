import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    FiHome,
    FiUsers,
    FiUserCheck,
    FiLink,
    FiDroplet,
    FiFileText,
    FiSettings,
    FiMenu,
    FiX
} from 'react-icons/fi';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/admin/consumers', icon: FiUsers, label: 'Consumers' },
        { path: '/admin/employees', icon: FiUserCheck, label: 'Employees' },
        { path: '/admin/assignments', icon: FiLink, label: 'Assignments' },
        { path: '/admin/daily-milk', icon: FiDroplet, label: 'Daily Milk' },
        { path: '/admin/deliveries', icon: FiFileText, label: 'Deliveries' },
        { path: '/admin/billing', icon: FiFileText, label: 'Billing' },
        { path: '/admin/settings', icon: FiSettings, label: 'Settings' }
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : ''
                }`
            }
            onClick={() => setIsOpen(false)}
        >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
        </NavLink>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
            >
                {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🥛</span>
                            </div>
                            <div className="ml-3">
                                <h2 className="text-lg font-semibold text-gray-900">Milk System</h2>
                                <p className="text-xs text-gray-500">Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500 text-center">
                            v1.0.0
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
