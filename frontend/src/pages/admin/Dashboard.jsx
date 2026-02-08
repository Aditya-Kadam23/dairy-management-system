import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiUsers, FiUserCheck, FiDroplet, FiDollarSign } from 'react-icons/fi';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalConsumers: 0,
        totalEmployees: 0,
        todayMilk: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch consumers count
            const consumersRes = await api.get('/consumers?limit=1');
            const employeesRes = await api.get('/employees?limit=1');

            // Get today's milk entry
            const today = new Date().toISOString().split('T')[0];
            let todayMilk = 0;
            try {
                const milkRes = await api.get(`/daily-milk/date/${today}`);
                todayMilk = milkRes.data.data.totalMilkCollected;
            } catch (err) {
                // No entry for today
            }

            // Get monthly billing
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            let monthlyRevenue = 0;
            try {
                const billingRes = await api.get(`/billing/report?month=${currentMonth}&year=${currentYear}`);
                monthlyRevenue = billingRes.data.data.summary.grandTotalAmount || 0;
            } catch (err) {
                // No billing data
            }

            setStats({
                totalConsumers: consumersRes.data.total || 0,
                totalEmployees: employeesRes.data.total || 0,
                todayMilk,
                monthlyRevenue
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Consumers',
            value: stats.totalConsumers,
            icon: FiUsers,
            bgColor: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        {
            title: 'Total Employees',
            value: stats.totalEmployees,
            icon: FiUserCheck,
            bgColor: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: "Today's Milk (L)",
            value: stats.todayMilk,
            icon: FiDroplet,
            bgColor: 'bg-purple-500',
            textColor: 'text-purple-600'
        },
        {
            title: 'Monthly Revenue (₹)',
            value: stats.monthlyRevenue.toFixed(2),
            icon: FiDollarSign,
            bgColor: 'bg-orange-500',
            textColor: 'text-orange-600'
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600 mt-1">Welcome to your dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`${stat.bgColor} bg-opacity-10 p-3 rounded-lg`}>
                                <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a
                        href="/admin/consumers"
                        className="btn-primary text-center py-3 px-4"
                    >
                        Add Consumer
                    </a>
                    <a
                        href="/admin/employees"
                        className="btn-primary text-center py-3 px-4"
                    >
                        Add Employee
                    </a>
                    <a
                        href="/admin/daily-milk"
                        className="btn-primary text-center py-3 px-4"
                    >
                        Record Milk
                    </a>
                    <a
                        href="/admin/billing"
                        className="btn-primary text-center py-3 px-4"
                    >
                        View Billing
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
