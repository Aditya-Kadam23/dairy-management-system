import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMessageSquare } from 'react-icons/fi';
import { validateMobileNumber, validateRequired, generateWhatsAppLink } from '../../utils/validators';

const Consumers = () => {
    const [consumers, setConsumers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedConsumer, setSelectedConsumer] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [consumerToDelete, setConsumerToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [defaultRate, setDefaultRate] = useState(60);
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        address: '',
        area: '',
        perLiterRate: '',
        dailyMilkQuota: ''
    });

    useEffect(() => {
        fetchConsumers();
        fetchDefaultRate();
    }, []);

    const fetchDefaultRate = async () => {
        try {
            const response = await api.get('/settings');
            setDefaultRate(response.data.data.defaultMilkRate);
        } catch (error) {
            console.error('Error fetching default rate:', error);
        }
    };

    const fetchConsumers = async () => {
        try {
            const response = await api.get('/consumers?limit=100');
            setConsumers(response.data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to fetch consumers');
            setLoading(false);
        }
    };

    const handleOpenModal = (consumer = null) => {
        if (consumer) {
            setEditMode(true);
            setSelectedConsumer(consumer);
            setFormData({
                fullName: consumer.fullName,
                mobileNumber: consumer.mobileNumber,
                address: consumer.address,
                area: consumer.area,
                perLiterRate: consumer.perLiterRate,
                dailyMilkQuota: consumer.dailyMilkQuota
            });
        } else {
            setEditMode(false);
            setSelectedConsumer(null);
            setFormData({
                fullName: '',
                mobileNumber: '',
                address: '',
                area: '',
                perLiterRate: defaultRate,
                dailyMilkQuota: ''
            });
        }
        setIsModalOpen(true);
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditMode(false);
        setSelectedConsumer(null);
        setFormData({
            fullName: '',
            mobileNumber: '',
            address: '',
            area: '',
            perLiterRate: '',
            dailyMilkQuota: ''
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!validateRequired(formData.fullName)) {
            setError('Full name is required');
            return;
        }

        if (!validateMobileNumber(formData.mobileNumber)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        if (!validateRequired(formData.address)) {
            setError('Address is required');
            return;
        }

        if (!validateRequired(formData.area)) {
            setError('Area is required');
            return;
        }

        try {
            if (editMode) {
                await api.put(`/consumers/${selectedConsumer._id}`, formData);
                setSuccess('Consumer updated successfully');
            } else {
                await api.post('/consumers', formData);
                setSuccess('Consumer added successfully');
            }

            fetchConsumers();
            handleCloseModal();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Operation failed');
        }
    };

    const handleDeleteClick = (consumer) => {
        setConsumerToDelete(consumer);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!consumerToDelete) return;

        try {
            await api.delete(`/consumers/${consumerToDelete._id}`);
            setSuccess('Consumer deleted successfully');
            fetchConsumers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Delete failed');
        } finally {
            setIsDeleteModalOpen(false);
            setConsumerToDelete(null);
        }
    };

    const filteredConsumers = consumers.filter(consumer =>
        consumer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumer.mobileNumber.includes(searchTerm) ||
        consumer.area.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h2 className="text-2xl font-bold text-gray-900">Consumers</h2>
                    <p className="text-gray-600 mt-1">Manage your milk consumers</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
                    <FiPlus className="mr-2" /> Add Consumer
                </button>
            </div>

            {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}
            {success && <ErrorAlert message={success} type="success" onClose={() => setSuccess('')} />}

            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, mobile, or area..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>


            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredConsumers.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-md">
                        No consumers found
                    </div>
                ) : (
                    filteredConsumers.map((consumer) => (
                        <div key={consumer._id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {consumer.fullName}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {consumer.mobileNumber}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(consumer)}
                                        className="text-blue-600 hover:text-blue-700 p-2"
                                        title="Edit"
                                    >
                                        <FiEdit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(consumer)}
                                        className="text-red-600 hover:text-red-700 p-2"
                                        title="Delete"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Area</span>
                                    <span className="font-medium text-gray-900">{consumer.area}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Daily Quota</span>
                                    <span className="font-medium text-gray-900">{consumer.dailyMilkQuota} L</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Rate</span>
                                    <span className="font-medium text-gray-900">₹{consumer.perLiterRate}/L</span>
                                </div>
                                <div className="pt-2">
                                    <p className="text-gray-600 mb-1">Assigned Employee:</p>
                                    {consumer.assignedEmployee ? (
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="font-medium text-gray-900">
                                                {consumer.assignedEmployee.name}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {consumer.assignedEmployee.mobileNumber}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Not Assigned</span>
                                    )}
                                </div>
                                <div className="pt-1">
                                    <p className="text-gray-600 mb-1">Address:</p>
                                    <p className="text-gray-900">{consumer.address}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Consumers Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hidden md:block">
                <div className="table-container">
                    <table className="table-auto">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Area</th>
                                <th>Address</th>
                                <th>Rate (₹/L)</th>
                                <th>Daily Quota (L)</th>
                                <th>Assigned Employee</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredConsumers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-gray-500">
                                        No consumers found
                                    </td>
                                </tr>
                            ) : (
                                filteredConsumers.map((consumer) => (
                                    <tr key={consumer._id}>
                                        <td className="font-medium">{consumer.fullName}</td>
                                        <td>{consumer.mobileNumber}</td>
                                        <td>{consumer.area}</td>
                                        <td className="max-w-xs truncate">{consumer.address}</td>
                                        <td>₹{consumer.perLiterRate}</td>
                                        <td>{consumer.dailyMilkQuota} L</td>
                                        <td>
                                            {consumer.assignedEmployee ? (
                                                <span className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {consumer.assignedEmployee.name}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {consumer.assignedEmployee.mobileNumber}
                                                    </div>
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">Not Assigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex space-x-2">
                                                <a
                                                    href={generateWhatsAppLink(consumer.mobileNumber)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-700 p-2"
                                                    title="Send WhatsApp"
                                                >
                                                    <FiMessageSquare className="w-5 h-5" />
                                                </a>
                                                <button
                                                    onClick={() => handleOpenModal(consumer)}
                                                    className="text-blue-600 hover:text-blue-700 p-2"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(consumer)}
                                                    className="text-red-600 hover:text-red-700 p-2"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editMode ? 'Edit Consumer' : 'Add Consumer'}
                size="lg"
            >
                {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number *
                            </label>
                            <input
                                type="text"
                                name="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="9876543210"
                                maxLength="10"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Area *
                            </label>
                            <input
                                type="text"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Per Liter Rate (₹) *
                            </label>
                            <input
                                type="number"
                                name="perLiterRate"
                                value={formData.perLiterRate}
                                onChange={handleChange}
                                className="input-field"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Daily Milk Quota (L)
                            </label>
                            <input
                                type="number"
                                name="dailyMilkQuota"
                                value={formData.dailyMilkQuota}
                                onChange={handleChange}
                                className="input-field"
                                step="0.5"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address *
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="input-field"
                            rows="3"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {editMode ? 'Update' : 'Add'} Consumer
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Consumer"
                message={`Are you sure you want to delete ${consumerToDelete?.fullName}? This action cannot be undone.`}
            />
        </div>
    );
};

export default Consumers;
