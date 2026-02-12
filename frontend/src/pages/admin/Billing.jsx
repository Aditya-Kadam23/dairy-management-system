import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, generateWhatsAppLink, formatDateDDMMYYYY } from '../../utils/validators';
import { FiMessageSquare, FiDownload, FiCalendar, FiFilter } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Billing = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('month'); // 'month' or 'range'
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (filterType === 'month') {
            fetchReport();
        }
    }, [month, year, filterType]);

    // For range, we manually trigger fetch
    const handleRangeFetch = () => {
        if (filterType === 'range') {
            fetchReport();
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            let query = `/billing/report?`;

            if (filterType === 'month') {
                query += `month=${month}&year=${year}`;
            } else {
                query += `startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await api.get(query);
            setReport(response.data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to fetch billing report');
            setLoading(false);
        }
    };

    const downloadBill = (consumer, totalQuantity, totalAmount) => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(41, 128, 185); // Blue color
        doc.text('Milk Bill Invoice', 105, 20, { align: 'center' });

        // Bill Details
        doc.setFontSize(10);
        doc.setTextColor(100);
        let periodStr = '';
        if (filterType === 'month') {
            periodStr = `${getMonthName(month)} ${year}`;
        } else {
            periodStr = `${formatDateDDMMYYYY(new Date(startDate))} to ${formatDateDDMMYYYY(new Date(endDate))}`;
        }

        // Left Side: Consumer Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Bill To:`, 14, 40);
        doc.setFontSize(11);
        doc.setTextColor(60);
        doc.text(consumer.fullName, 14, 48);
        doc.text(consumer.mobileNumber, 14, 54);
        doc.text(consumer.area, 14, 60);

        // Right Side: Invoice Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Invoice Details:`, 140, 40);
        doc.setFontSize(11);
        doc.setTextColor(60);
        doc.text(`Date: ${formatDateDDMMYYYY(new Date())}`, 140, 48);
        doc.text(`Period: ${periodStr}`, 140, 54);

        // Table
        const tableColumn = ["Description", "Quantity (L)", "Rate (Rs/L)", "Amount (Rs)"];
        const tableRows = [
            [
                "Milk Supply",
                totalQuantity.toFixed(2),
                consumer.perLiterRate,
                formatCurrency(totalAmount).replace('₹', '')
            ]
        ];

        autoTable(doc, {
            head: tableColumn,
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 3 },
        });

        const finalY = (doc).lastAutoTable.finalY + 10;

        // Total
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 140, finalY);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Thank you for your business!', 105, finalY + 20, { align: 'center' });

        // Save
        const fileName = `Bill-${consumer.fullName.replace(/\s+/g, '_')}-${periodStr.replace(/ /g, '_')}.pdf`;
        doc.save(fileName);
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

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
                {/* Filter Type Toggle */}
                <div className="flex space-x-4 mb-4 border-b pb-4">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="filterType"
                            value="month"
                            checked={filterType === 'month'}
                            onChange={() => setFilterType('month')}
                            className="form-radio text-primary-600"
                        />
                        <span className="ml-2 text-gray-700">Monthly View</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="filterType"
                            value="range"
                            checked={filterType === 'range'}
                            onChange={() => setFilterType('range')}
                            className="form-radio text-primary-600"
                        />
                        <span className="ml-2 text-gray-700">Custom Date Range</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {filterType === 'month' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
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
                                className="btn-primary flex items-center justify-center opacity-0 pointer-events-none"
                            >
                                <FiFilter className="mr-2" /> Refresh
                            </button>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <button
                                onClick={handleRangeFetch}
                                className="btn-primary flex items-center justify-center"
                            >
                                <FiFilter className="mr-2" /> Generate Report
                            </button>
                        </>
                    )}
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
                                <button
                                    onClick={() => downloadBill(item.consumer, item.totalQuantity, item.totalAmount)}
                                    className="w-full btn-secondary flex items-center justify-center py-2 mt-2"
                                >
                                    <FiDownload className="mr-2" /> Download PDF
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
                                            <button
                                                onClick={() => downloadBill(item.consumer, item.totalQuantity, item.totalAmount)}
                                                className="text-blue-600 hover:text-blue-700 flex items-center mt-1"
                                                title="Download PDF Bill"
                                            >
                                                <FiDownload className="w-5 h-5 mr-1" />
                                                PDF
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
