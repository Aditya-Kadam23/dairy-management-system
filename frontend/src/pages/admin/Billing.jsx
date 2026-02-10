import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, generateWhatsAppLink } from '../../utils/validators';
import { FiMessageSquare, FiDownload } from 'react-icons/fi';

const Billing = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchReport();
    }, [month, year]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/billing/report?month=${month}&year=${year}`);
            setReport(response.data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to fetch billing report');
            setLoading(false);
        }
    };

    const sendBillingMessage = (consumer, totalQuantity, totalAmount) => {
        const message = `Dear ${consumer.fullName},\n\nYour milk bill for ${getMonthName(month)} ${year}:\n\nQuantity: ${totalQuantity}L\nRate: ₹${consumer.perLiterRate}/L\nTotal Amount: ${formatCurrency(totalAmount)}\n\nThank you!`;

        window.open(generateWhatsAppLink(consumer.mobileNumber, message), '_blank');
    };

    const getMonthName = (monthNum) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthNum - 1];
    };

    if (loading) {
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
                    <h2 className="text-2xl font-bold text-gray-900">Monthly Billing</h2>
                    <p className="text-gray-600 mt-1">View and manage consumer billing</p>
                </div>
            </div>

            {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}

            {/* Month/Year Selector */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Month
                        </label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="input-field"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{getMonthName(m)}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year
                        </label>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="input-field"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={fetchReport}
                        className="btn-primary flex items-center justify-center"
                    >
                        <FiDownload className="mr-2" /> Generate Report
                    </button>
                </div>
            </div>

            {/* Summary */}
            {report && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Total Consumers</p>
                            <p className="text-2xl font-bold text-blue-900">{report.summary.totalConsumers}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">Total Quantity</p>
                            <p className="text-2xl font-bold text-green-900">{report.summary.grandTotalQuantity.toFixed(2)} L</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <p className="text-sm text-orange-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-orange-900">{formatCurrency(report.summary.grandTotalAmount)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Consumer Billing Table */}
            {report && report.consumerBilling.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4 bg-gray-50">
                        {report.consumerBilling.map((item) => (
                            <div key={item.consumer._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-lg">
                                            {item.consumer.fullName}
                                        </h4>
                                        <div className="text-sm text-gray-500 mt-1">
                                            <p>{item.consumer.area}</p>
                                            <p>{item.consumer.mobileNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-xl text-green-600">
                                            {formatCurrency(item.totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded">
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider block">Quantity</span>
                                        <span className="font-medium text-gray-900">{item.totalQuantity.toFixed(2)} L</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider block">Rate</span>
                                        <span className="font-medium text-gray-900">₹{item.consumer.perLiterRate}/L</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => sendBillingMessage(item.consumer, item.totalQuantity, item.totalAmount)}
                                    className="w-full btn-primary flex items-center justify-center py-2"
                                >
                                    <FiMessageSquare className="mr-2" /> Send Bill via WhatsApp
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="table-container hidden md:block">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>Consumer</th>
                                    <th>Mobile</th>
                                    <th>Area</th>
                                    <th>Quantity (L)</th>
                                    <th>Rate (₹/L)</th>
                                    <th>Total Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.consumerBilling.map((item) => (
                                    <tr key={item.consumer._id}>
                                        <td className="font-medium">{item.consumer.fullName}</td>
                                        <td>{item.consumer.mobileNumber}</td>
                                        <td>{item.consumer.area}</td>
                                        <td>{item.totalQuantity.toFixed(2)}</td>
                                        <td>₹{item.consumer.perLiterRate}</td>
                                        <td className="font-semibold text-green-600">
                                            {formatCurrency(item.totalAmount)}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => sendBillingMessage(item.consumer, item.totalQuantity, item.totalAmount)}
                                                className="text-green-600 hover:text-green-700 flex items-center"
                                                title="Send Bill via WhatsApp"
                                            >
                                                <FiMessageSquare className="w-5 h-5 mr-1" />
                                                Send Bill
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">No billing data for this period</p>
                </div>
            )}
        </div>
    );
};

export default Billing;
