import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiCheck, FiClock, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { formatDateDDMMYYYY } from '../../utils/validators';

const Deliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [dailyEntries, setDailyEntries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [refreshSuccess, setRefreshSuccess] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedEmployee, startDate, endDate]);

    const handleRefresh = async () => {
        setLoading(true);
        await fetchData();
        setRefreshSuccess('✅ Data updated successfully');
        setTimeout(() => setRefreshSuccess(''), 3000);
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees?limit=100');
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            let deliveryQuery = '/daily-milk/deliveries?limit=1000';
            let entryQuery = '/daily-milk?limit=100';

            const params = [];
            if (selectedEmployee) params.push(`employeeId=${selectedEmployee}`); // Backend needs to support filter by employee for entries if we want precise filtering, but typically entries are by date. Logic below filters manually if needed.
            if (startDate) params.push(`startDate=${startDate}`);
            if (endDate) params.push(`endDate=${endDate}`);

            const queryString = params.length > 0 ? `&${params.join('&')}` : '';

            const [deliveriesRes, entriesRes] = await Promise.all([
                api.get(`${deliveryQuery}${queryString}`),
                api.get(`${entryQuery}${queryString}`)
            ]);

            setDeliveries(deliveriesRes.data.data);
            setDailyEntries(entriesRes.data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to fetch data');
            setLoading(false);
        }
    };

    const handleVerify = async (date, employeeId) => {
        try {
            // date coming from entry.entryDate is standard format
            const formattedDate = new Date(date).toISOString().split('T')[0];
            await api.put(`/daily-milk/verify/${formattedDate}/${employeeId}`);
            setRefreshSuccess('✅ Employee day verified successfully');
            fetchData(); // Reload to update UI
            setTimeout(() => setRefreshSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Verification failed');
        }
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Grouping Logic: Date -> Employee
    const groupedData = dailyEntries.reduce((acc, entry) => {
        const date = new Date(entry.entryDate).toISOString().split('T')[0];

        if (!acc[date]) {
            acc[date] = {};
        }

        entry.employeeAllocations.forEach(alloc => {
            // Filter by selected employee if set
            if (selectedEmployee && alloc.employeeId._id !== selectedEmployee) return;

            const empId = alloc.employeeId._id;

            // Get deliveries for this employee on this date
            const empDeliveries = deliveries.filter(d =>
                new Date(d.deliveryDate).toISOString().split('T')[0] === date &&
                d.employeeId._id === empId
            );

            acc[date][empId] = {
                employee: alloc.employeeId,
                allocation: alloc,
                deliveries: empDeliveries,
                entryDate: entry.entryDate
            };
        });

        return acc;
    }, {});

    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));

    if (loading && !deliveries.length && !dailyEntries.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
                    <p className="text-gray-600 mt-1">Monitor daily deliveries and collections</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="btn-primary flex items-center"
                    disabled={loading}
                >
                    <FiCheck className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}
            {refreshSuccess && <ErrorAlert message={refreshSuccess} type="success" onClose={() => setRefreshSuccess('')} />}

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

            {/* Content */}
            {sortedDates.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">No records found for the selected criteria</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedDates.map((date) => (
                        <div key={date} className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                                {formatDateDDMMYYYY(new Date(date))}
                            </h3>

                            {Object.values(groupedData[date]).map((item) => {
                                const { employee, allocation, deliveries, entryDate } = item;
                                const remaining = allocation.allocatedQuantity - allocation.deliveredQuantity;
                                const isVerified = allocation.isVerified;
                                const groupId = `${date}-${employee._id}`;
                                const isExpanded = expandedGroups[groupId];

                                return (
                                    <div key={employee._id} className={`bg-white rounded-lg shadow-md border-l-4 ${isVerified ? 'border-green-500' : 'border-yellow-500'} overflow-hidden`}>
                                        <div className="p-4 sm:p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-xl font-semibold text-gray-900">{employee.name}</h4>
                                                        {isVerified ? (
                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                                                                <FiCheck className="mr-1" /> Verified
                                                            </span>
                                                        ) : (
                                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                                                                <FiClock className="mr-1" /> Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">{employee.mobileNumber}</p>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase">Allocated</p>
                                                        <p className="font-semibold text-gray-900">{allocation.allocatedQuantity} L</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase">Delivered</p>
                                                        <p className="font-semibold text-blue-600">{allocation.deliveredQuantity} L</p>
                                                    </div>
                                                    <div className={`p-1 rounded ${isVerified ? 'bg-green-50' : 'bg-red-50'}`}>
                                                        <p className="text-xs text-gray-500 uppercase">
                                                            {isVerified ? 'Recollected' : 'Remaining'}
                                                        </p>
                                                        <p className={`font-bold ${isVerified ? 'text-green-700' : 'text-red-600'}`}>
                                                            {remaining} L
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-4 md:mt-0">
                                                    {!isVerified && (
                                                        <button
                                                            onClick={() => handleVerify(entryDate, employee._id)}
                                                            className="btn-primary text-sm whitespace-nowrap"
                                                        >
                                                            <FiCheck className="mr-1 inline" /> Verify & Close
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => toggleGroup(groupId)}
                                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                                                    >
                                                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable Consumer List */}
                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Consumer Deliveries ({deliveries.length})</h5>

                                                    {deliveries.length === 0 ? (
                                                        <p className="text-sm text-gray-500 italic">No deliveries recorded yet.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {deliveries.map(delivery => (
                                                                <div key={delivery._id} className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
                                                                    <div>
                                                                        <span className="font-medium text-gray-900">{delivery.consumerId.fullName}</span>
                                                                        <span className="text-gray-500 mx-2">•</span>
                                                                        <span className="text-gray-500">{delivery.consumerId.area}</span>
                                                                    </div>
                                                                    <div className="font-semibold text-primary-600">
                                                                        {delivery.quantityDelivered} L
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Deliveries;
