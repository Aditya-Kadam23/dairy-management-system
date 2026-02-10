import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiCheck, FiClock } from 'react-icons/fi';
import { formatDateForInput } from '../../utils/validators';

const MyDeliveries = () => {
    const [assignments, setAssignments] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            const [assignmentsRes, deliveriesRes] = await Promise.all([
                api.get('/assignments/my-assignments'),
                api.get(`/daily-milk/deliveries?startDate=${selectedDate}&endDate=${selectedDate}`)
            ]);

            setAssignments(assignmentsRes.data.data);
            setDeliveries(deliveriesRes.data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to fetch data');
            setLoading(false);
        }
    };

    const isDeliveryCompleted = (consumerId) => {
        return deliveries.some(
            delivery => delivery.consumerId._id === consumerId &&
                new Date(delivery.deliveryDate).toISOString().split('T')[0] === selectedDate
        );
    };

    const handleMarkDelivery = async (consumerId, quantity) => {
        if (!quantity || quantity <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/daily-milk/my-delivery', {
                consumerId,
                deliveryDate: selectedDate,
                quantityDelivered: parseFloat(quantity)
            });

            setSuccess('Delivery marked successfully!');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Failed to record delivery');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
                <p className="text-gray-600 mt-1">Mark milk deliveries to customers</p>
            </div>

            {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}
            {success && <ErrorAlert message={success} type="success" onClose={() => setSuccess('')} />}

            {/* Date Selector */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field"
                    max={formatDateForInput(new Date())}
                />
            </div>

            {/* Assignments List */}
            {assignments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">No consumers assigned yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {assignments.map((assignment) => {
                        const completed = isDeliveryCompleted(assignment.consumerId._id);

                        return (
                            <DeliveryCard
                                key={assignment._id}
                                assignment={assignment}
                                completed={completed}
                                onMarkDelivery={handleMarkDelivery}
                                submitting={submitting}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const DeliveryCard = ({ assignment, completed, onMarkDelivery, submitting }) => {
    const [extraQuantity, setExtraQuantity] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const consumer = assignment.consumerId;
    const defaultQuota = assignment.consumerId.dailyMilkQuota || 0;
    const totalQuantity = parseFloat(defaultQuota) + parseFloat(extraQuantity || 0);

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden ${completed ? 'border-2 border-green-500' : ''
            }`}>
            <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            {consumer.fullName}
                            {completed && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <FiCheck className="w-3 h-3 mr-1" /> Delivered
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-primary-600 font-medium">
                                Default: {defaultQuota}L
                            </p>
                            {!completed && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Extra:</span>
                                    <input
                                        type="number"
                                        value={extraQuantity}
                                        onChange={(e) => setExtraQuantity(e.target.value)}
                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        step="0.5"
                                        min="0"
                                        placeholder="0"
                                    />
                                    <span className="text-sm text-gray-500">L</span>
                                </div>
                            )}
                        </div>
                        {!completed && extraQuantity > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                                Total: {totalQuantity}L
                            </p>
                        )}
                    </div>
                </div>

                {!completed && (
                    <div className="pt-3 border-t border-gray-200">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full btn-primary flex items-center justify-center"
                        >
                            {isExpanded ? 'Cancel' : 'Mark Delivery'}
                        </button>

                        {isExpanded && (
                            <div className="mt-3">
                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-gray-600">Default Quota:</span>
                                        <span className="font-medium text-gray-900">{defaultQuota}L</span>
                                    </div>
                                    {extraQuantity > 0 && (
                                        <>
                                            <div className="flex justify-between items-center text-sm mb-1">
                                                <span className="text-gray-600">Extra:</span>
                                                <span className="font-medium text-gray-900">+{extraQuantity}L</span>
                                            </div>
                                            <div className="border-t border-gray-300 pt-1 mt-1">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-semibold text-gray-700">Total Delivery:</span>
                                                    <span className="font-bold text-primary-600">{totalQuantity}L</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => onMarkDelivery(consumer._id, totalQuantity)}
                                    disabled={submitting || totalQuantity <= 0}
                                    className="w-full btn-primary disabled:opacity-50"
                                >
                                    {submitting ? <LoadingSpinner size="sm" /> : 'Confirm Delivery'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {completed && (
                    <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center text-green-600 text-sm font-medium">
                            <FiCheck className="w-4 h-4 mr-2" />
                            Delivery completed for this date
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDeliveries;
