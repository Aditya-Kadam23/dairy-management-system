import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateForInput } from '../../utils/validators';
import { FiClock, FiChevronDown, FiChevronRight, FiCalendar, FiRefreshCw } from 'react-icons/fi';

const DailyMilk = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [entryDate, setEntryDate] = useState(formatDateForInput(new Date()));
    const [totalMilk, setTotalMilk] = useState('');
    const [allocations, setAllocations] = useState([]);

    // History state
    const [showHistory, setShowHistory] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [historyFilters, setHistoryFilters] = useState({
        startDate: formatDateForInput(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
        endDate: formatDateForInput(new Date())
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees?isActive=true&limit=100');
            setEmployees(response.data.data);

            // Initialize allocations
            setAllocations(
                response.data.data.map(emp => ({
                    employeeId: emp._id,
                    name: emp.name,
                    allocatedQuantity: 0
                }))
            );
        } catch (error) {
            setError('Failed to fetch employees');
        }
    };

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            const response = await api.get('/daily-milk', {
                params: {
                    startDate: historyFilters.startDate,
                    endDate: historyFilters.endDate,
                    limit: 100
                }
            });
            setHistoryData(response.data.data || []);
        } catch (error) {
            setError('Failed to fetch history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleOpenHistory = () => {
        setShowHistory(true);
        fetchHistory();
    };

    const loadFromDeliveries = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Fetch all deliveries for the selected date
            const response = await api.get('/daily-milk/deliveries', {
                params: {
                    startDate: entryDate,
                    endDate: entryDate,
                    limit: 1000 // Get all deliveries for the day
                }
            });

            const deliveries = response.data.data;

            if (deliveries.length === 0) {
                setError('No deliveries found for this date. Employees may not have recorded deliveries yet.');
                return;
            }

            // Group deliveries by employee and calculate totals
            const employeeMap = {};
            let totalCollected = 0;

            deliveries.forEach(delivery => {
                const empId = delivery.employeeId._id;
                const empName = delivery.employeeId.name;
                const quantity = delivery.quantityDelivered;

                if (!employeeMap[empId]) {
                    employeeMap[empId] = {
                        employeeId: empId,
                        name: empName,
                        totalQuantity: 0
                    };
                }

                employeeMap[empId].totalQuantity += quantity;
                totalCollected += quantity;
            });

            // Update allocations with calculated values
            const updatedAllocations = allocations.map(alloc => {
                const empData = employeeMap[alloc.employeeId];
                if (empData) {
                    return {
                        ...alloc,
                        allocatedQuantity: empData.totalQuantity
                    };
                }
                return alloc; // Keep existing allocation (will be 0 if not initialized)
            });

            // Set total milk and allocations
            setTotalMilk(totalCollected.toFixed(2));
            setAllocations(updatedAllocations);

            // Show success message
            const employeeCount = Object.keys(employeeMap).length;
            setSuccess(`✅ Loaded ${deliveries.length} deliveries from ${employeeCount} employee(s). Total: ${totalCollected.toFixed(2)}L`);
            setTimeout(() => setSuccess(''), 5000);

        } catch (error) {
            setError(error.message || 'Failed to load delivery data');
        } finally {
            setLoading(false);
        }
    };

    const handleAllocationChange = (empId, value) => {
        setAllocations(allocations.map(alloc =>
            alloc.employeeId === empId
                ? { ...alloc, allocatedQuantity: parseFloat(value) || 0 }
                : alloc
        ));
    };

    const getTotalAllocated = () => {
        return allocations.reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);
    };

    const toggleExpandRow = (index) => {
        setExpandedRows(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const totalAllocated = getTotalAllocated();
        const totalMilkNum = parseFloat(totalMilk);

        if (Math.abs(totalAllocated - totalMilkNum) > 0.01) {
            setError(`Total allocated (${totalAllocated}L) must match total collected (${totalMilkNum}L)`);
            return;
        }

        const employeeAllocations = allocations
            .filter(alloc => alloc.allocatedQuantity > 0)
            .map(alloc => ({
                employeeId: alloc.employeeId,
                allocatedQuantity: alloc.allocatedQuantity
            }));

        try {
            setLoading(true);
            await api.post('/daily-milk', {
                entryDate,
                totalMilkCollected: totalMilkNum,
                employeeAllocations
            });

            setSuccess('Daily milk entry recorded successfully');
            setTotalMilk('');
            setAllocations(allocations.map(alloc => ({ ...alloc, allocatedQuantity: 0 })));
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Failed to record entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Daily Milk Entry</h2>
                    <p className="text-gray-600 mt-1">Record daily milk collection and distribution</p>
                </div>
                <button
                    onClick={handleOpenHistory}
                    className="btn-secondary flex items-center justify-center"
                >
                    <FiClock className="mr-2" /> View History
                </button>
            </div>

            {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}
            {success && <ErrorAlert message={success} type="success" onClose={() => setSuccess('')} />}

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Entry Date *
                            </label>
                            <input
                                type="date"
                                value={entryDate}
                                onChange={(e) => setEntryDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Milk Collected (Liters) *
                            </label>
                            <input
                                type="number"
                                value={totalMilk}
                                onChange={(e) => setTotalMilk(e.target.value)}
                                className="input-field"
                                step="0.5"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Employee Allocations
                        </h3>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Total Allocated:</span>
                                <span className={`text-lg font-bold ${getTotalAllocated() === parseFloat(totalMilk || 0)
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>
                                    {getTotalAllocated().toFixed(2)} L
                                </span>
                            </div>
                            {totalMilk && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Remaining: {(parseFloat(totalMilk) - getTotalAllocated()).toFixed(2)} L
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {allocations.map((alloc) => (
                                <div key={alloc.employeeId} className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            {alloc.name}
                                        </label>
                                    </div>
                                    <div className="w-40">
                                        <input
                                            type="number"
                                            value={alloc.allocatedQuantity || ''}
                                            onChange={(e) => handleAllocationChange(alloc.employeeId, e.target.value)}
                                            className="input-field"
                                            step="0.5"
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600">Liters</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={loadFromDeliveries}
                            disabled={loading}
                            className="btn-secondary disabled:opacity-50 flex items-center justify-center"
                        >
                            <FiRefreshCw className="mr-2" /> Load from Deliveries
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary disabled:opacity-50"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : 'Record Entry'}
                        </button>
                    </div>
                </form>
            </div>

            {/* History Modal */}
            <Modal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                title="Daily Milk History"
                size="xl"
            >
                <div className="space-y-4">
                    {/* Date Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={historyFilters.startDate}
                                onChange={(e) => setHistoryFilters({ ...historyFilters, startDate: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={historyFilters.endDate}
                                onChange={(e) => setHistoryFilters({ ...historyFilters, endDate: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchHistory}
                                className="btn-primary w-full"
                            >
                                <FiCalendar className="inline mr-2" /> Filter
                            </button>
                        </div>
                    </div>

                    {/* History Table */}
                    {historyLoading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : historyData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No records found for the selected date range
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table-auto">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Total Milk</th>
                                        <th>Employees</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.map((entry, index) => (
                                        <React.Fragment key={entry._id}>
                                            <tr>
                                                <td className="font-medium">
                                                    {new Date(entry.entryDate).toLocaleDateString('en-IN')}
                                                </td>
                                                <td>{entry.totalMilkCollected}L</td>
                                                <td>{entry.employeeAllocations?.length || 0}</td>
                                                <td>
                                                    <button
                                                        onClick={() => toggleExpandRow(index)}
                                                        className="text-primary-600 hover:text-primary-700 p-2"
                                                    >
                                                        {expandedRows.includes(index) ? (
                                                            <FiChevronDown className="w-5 h-5" />
                                                        ) : (
                                                            <FiChevronRight className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRows.includes(index) && (
                                                <tr>
                                                    <td colSpan="4" className="bg-gray-50">
                                                        <div className="p-4">
                                                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                                                Employee Allocations:
                                                            </h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {entry.employeeAllocations?.map((alloc) => (
                                                                    <div
                                                                        key={alloc.employeeId._id}
                                                                        className="flex justify-between text-sm"
                                                                    >
                                                                        <span className="text-gray-700">
                                                                            {alloc.employeeId.name}
                                                                        </span>
                                                                        <span className="font-medium text-gray-900">
                                                                            {alloc.allocatedQuantity}L
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default DailyMilk;
