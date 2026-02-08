import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiCheck, FiClock, FiFilter } from 'react-icons/fi';
import { formatDate } from '../../utils/validators';

const Deliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchDeliveries();
    }, [selectedEmployee, startDate, endDate]);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees?limit=100');
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchDeliveries = async () => {
        try {
            let query = '/daily-milk/deliveries?limit=100';
            if (selectedEmployee) query += `&employeeId=${selectedEmployee}`;
            if (startDate) query += `&startDate=${startDate}`;
            if (endDate) query += `&endDate=${endDate}`;

            const response = await api.get(query);
            setDeliveries(response.data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to fetch deliveries');
            setLoading(false);
        }
    };

    // Group deliveries by date
    const groupedDeliveries = deliveries.reduce((groups, delivery) => {
        const date = new Date(delivery.deliveryDate).toISOString().split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(delivery);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedDeliveries).sort((a, b) => new Date(b) - new Date(a));

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
                <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
                <p className="text-gray-600 mt-1">View all milk deliveries</p>
            </div>

            {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-4">
                    <FiFilter className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee
                        </label>
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Employees</option>
                            {employees.map((emp) => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>
            </div>

            {/* Deliveries by Date */}
            {sortedDates.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">No deliveries found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedDates.map((date) => {
                        const dayDeliveries = groupedDeliveries[date];
                        const totalQuantity = dayDeliveries.reduce((sum, d) => sum + d.quantityDelivered, 0);

                        return (
                            <div key={date} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {formatDate(new Date(date))}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {dayDeliveries.length} deliveries • Total: {totalQuantity.toFixed(2)}L
                                            </p>
                                        </div>
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <FiCheck className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="table-auto">
                                        <thead>
                                            <tr>
                                                <th>Employee</th>
                                                <th>Consumer</th>
                                                <th>Area</th>
                                                <th>Quantity (L)</th>
                                                <th>Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dayDeliveries.map((delivery) => (
                                                <tr key={delivery._id}>
                                                    <td className="font-medium">{delivery.employeeId.name}</td>
                                                    <td>{delivery.consumerId.fullName}</td>
                                                    <td>{delivery.consumerId.area}</td>
                                                    <td className="font-semibold text-primary-600">
                                                        {delivery.quantityDelivered}L
                                                    </td>
                                                    <td className="text-sm text-gray-500">
                                                        {new Date(delivery.createdAt).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Deliveries;
