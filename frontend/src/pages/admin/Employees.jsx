import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiKey } from 'react-icons/fi';
import { validateMobileNumber, validateRequired } from '../../utils/validators';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        assignedArea: '',
        password: ''
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees?limit=100');
            setEmployees(response.data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to fetch employees');
            setLoading(false);
        }
    };

    const handleOpenModal = (employee = null) => {
        if (employee) {
            setEditMode(true);
            setSelectedEmployee(employee);
            setFormData({
                name: employee.name,
                mobileNumber: employee.mobileNumber,
                assignedArea: employee.assignedArea || '',
                password: ''
            });
        } else {
            setEditMode(false);
            setSelectedEmployee(null);
            setFormData({
                name: '',
                mobileNumber: '',
                assignedArea: '',
                password: ''
            });
        }
        setIsModalOpen(true);
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditMode(false);
        setSelectedEmployee(null);
        setFormData({
            name: '',
            mobileNumber: '',
            assignedArea: '',
            password: ''
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
        if (!validateRequired(formData.name)) {
            setError('Name is required');
            return;
        }

        if (!validateMobileNumber(formData.mobileNumber)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        try {
            if (editMode) {
                await api.put(`/employees/${selectedEmployee._id}`, formData);
                setSuccess('Employee updated successfully');
            } else {
                await api.post('/employees', formData);
                setSuccess('Employee added successfully');
            }

            fetchEmployees();
            handleCloseModal();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Operation failed');
        }
    };

    const handleDeleteClick = (employee) => {
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!employeeToDelete) return;

        try {
            await api.delete(`/employees/${employeeToDelete._id}`);
            setSuccess('Employee deleted successfully');
            fetchEmployees();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Delete failed');
        } finally {
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.mobileNumber.includes(searchTerm)
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
                    <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
                    <p className="text-gray-600 mt-1">Manage delivery staff</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
                    <FiPlus className="mr-2" /> Add Employee
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
                        placeholder="Search by name or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>


            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredEmployees.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-md">
                        No employees found
                    </div>
                ) : (
                    filteredEmployees.map((employee) => (
                        <div key={employee._id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {employee.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {employee.mobileNumber}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(employee)}
                                        className="text-blue-600 hover:text-blue-700 p-2"
                                        title="Edit"
                                    >
                                        <FiEdit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(employee)}
                                        className="text-red-600 hover:text-red-700 p-2"
                                        title="Delete"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Assigned Area</span>
                                    <span className="font-medium text-gray-900">{employee.assignedArea || '-'}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-gray-600">Status</span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${employee.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {employee.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hidden md:block">
                <div className="table-container">
                    <table className="table-auto">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Assigned Area</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        No employees found
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee._id}>
                                        <td className="font-medium">{employee.name}</td>
                                        <td>{employee.mobileNumber}</td>
                                        <td>{employee.assignedArea || '-'}</td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${employee.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {employee.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(employee)}
                                                    className="text-blue-600 hover:text-blue-700 p-2"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(employee)}
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
                title={editMode ? 'Edit Employee' : 'Add Employee'}
            >
                {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
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
                            disabled={editMode}
                        />
                        {editMode && (
                            <p className="text-xs text-gray-500 mt-1">Mobile number cannot be changed</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assigned Area
                        </label>
                        <input
                            type="text"
                            name="assignedArea"
                            value={formData.assignedArea}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>

                    {!editMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Leave empty to use mobile number as password"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Default password is the mobile number
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {editMode ? 'Update' : 'Add'} Employee
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Employee"
                message={`Are you sure you want to delete ${employeeToDelete?.name}? This action cannot be undone.`}
            />
        </div>
    );
};

export default Employees;
