import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPhone, FiMapPin } from 'react-icons/fi';

const MyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await api.get('/assignments/my-assignments');
            setAssignments(response.data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to fetch assignments');
            setLoading(false);
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
                <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
                <p className="text-gray-600 mt-1">View your assigned consumers</p>
            </div>

            {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}

            {assignments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">No consumers assigned yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {assignments.map((assignment) => (
                        <div
                            key={assignment._id}
                            className="bg-white rounded-lg shadow-md p-4 active:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {assignment.consumerId.fullName}
                                    </h3>
                                    {assignment.dailyMilkQuota > 0 && (
                                        <p className="text-sm text-primary-600 font-medium mt-1">
                                            Daily Quota: {assignment.dailyMilkQuota}L
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-start">
                                    <FiMapPin className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium">{assignment.consumerId.area}</p>
                                        <p className="text-gray-500">{assignment.consumerId.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
                                    <a
                                        href={`tel:${assignment.consumerId.mobileNumber}`}
                                        className="text-sm text-primary-600 font-medium hover:underline"
                                    >
                                        {assignment.consumerId.mobileNumber}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is a view-only interface. You cannot make any changes.
                    Contact the admin for any updates to your assignments.
                </p>
            </div>
        </div>
    );
};

export default MyAssignments;
