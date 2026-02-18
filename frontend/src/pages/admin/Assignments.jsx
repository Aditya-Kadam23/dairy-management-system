import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [consumers, setConsumers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        employeeId: '',
        consumerId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignmentsRes, employeesRes, consumersRes] = await Promise.all([
                api.get('/assignments'),
                api.get('/employees?limit=100'),
                api.get('/consumers?limit=100&isActive=true&unassigned=true')
            ]);

            setAssignments(assignmentsRes.data.data);
            setEmployees(employeesRes.data.data);
            setConsumers(consumersRes.data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'Failed to fetch data');
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setEditingId(null);
        setFormData({
            employeeId: '',
            consumerId: '',
            dailyMilkQuota: '0'
        });
        setIsModalOpen(true);
        setError('');
    };

    const handleEdit = (assignment) => {
        setEditingId(assignment._id);
        setFormData({
            employeeId: assignment.employeeId._id,
            consumerId: assignment.consumerId._id
        });
        setEditingAssignment(assignment);
        setIsModalOpen(true);
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            employeeId: '',
            consumerId: ''
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

        if (!formData.employeeId || !formData.consumerId) {
            setError('Please select both employee and consumer');
            return;
        }

        try {
            if (editingId) {
                await api.put(`/assignments/${editingId}`, formData);
                setSuccess('Assignment updated successfully');
            } else {
                await api.post('/assignments', formData);
                setSuccess('Assignment created successfully');
            }
            fetchData();
            handleCloseModal();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Operation failed');
        }
    };

    const handleDeleteClick = (assignment) => {
        setAssignmentToDelete(assignment);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!assignmentToDelete) return;

        try {
            await api.delete(`/assignments/${assignmentToDelete._id}`);
            setSuccess('Assignment deleted successfully');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Delete failed');
        } finally {
            setIsDeleteModalOpen(false);
            setAssignmentToDelete(null);
        }
    };

    // Group assignments by employee
    const employeeGroups = {};
    assignments.forEach(assignment => {
        // Skip invalid assignments
        if (!assignment || !assignment.employeeId || !assignment.consumerId) return;

        const empId = assignment.employeeId._id;
        if (!employeeGroups[empId]) {
            employeeGroups[empId] = {
                employee: assignment.employeeId,
                assignments: []
            };
        }
        employeeGroups[empId].assignments.push(assignment);
    });

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
                    <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
                    <p className="text-gray-600 mt-1">Assign consumers to employees</p>
                </div>
                <button onClick={handleOpenModal} className="btn-primary flex items-center">
                    <FiPlus className="mr-2" /> New Assignment
                </button>
            </div>

            {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}
            {success && <ErrorAlert message={success} type="success" onClose={() => setSuccess('')} />}

            {/* Assignments by Employee */}
            <div className="space-y-4">
                {Object.keys(employeeGroups).length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-500">No assignments yet</p>
                    </div>
                ) : (
                    Object.values(employeeGroups).map((group) => (
                        <div key={group.employee._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-primary-50 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {group.employee.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {group.employee.mobileNumber} • {group.employee.assignedArea || 'No area assigned'} • {group.assignments.length} consumer(s)
                                </p>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3 p-4">
                                {group.assignments.map((assignment) => (
                                    <div key={assignment._id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {assignment.consumerId.fullName}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {assignment.consumerId.mobileNumber}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(assignment)}
                                                    className="text-blue-600 hover:text-blue-700 p-2"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(assignment)}
                                                    className="text-red-600 hover:text-red-700 p-2"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Area:</span>
                                                <span className="text-gray-900">{assignment.consumerId?.area}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Daily Quota:</span>
                                                <span className="font-medium text-gray-900">
                                                    {assignment.consumerId?.dailyMilkQuota} L
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="table-container hidden md:block">
                                <table className="table-auto">
                                    <thead>
                                        <tr>
                                            <th>Consumer Name</th>
                                            <th>Mobile</th>
                                            <th>Area</th>
                                            <th>Daily Quota (L)</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.assignments.map((assignment) => (
                                            <tr key={assignment._id}>
                                                <td className="font-medium">{assignment.consumerId?.fullName}</td>
                                                <td>{assignment.consumerId?.mobileNumber}</td>
                                                <td>{assignment.consumerId?.area}</td>
                                                <td>{assignment.consumerId?.dailyMilkQuota} L</td>
                                                <td>
                                                    <div className="flex justify-center space-x-3">
                                                        <button
                                                            onClick={() => handleEdit(assignment)}
                                                            className="text-blue-600 hover:text-blue-700 p-2"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(assignment)}
                                                            className="text-red-600 hover:text-red-700 p-2"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Assignment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "Edit Assignment" : "Create Assignment"}
            >
                {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee *
                        </label>
                        <select
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            <option value="">Select Employee</option>
                            {employees.map((employee) => (
                                <option key={employee._id} value={employee._id}>
                                    {employee.name} - {employee.mobileNumber}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Consumer *
                        </label>
                        {editingId ? (
                            <input
                                type="text"
                                value={editingAssignment?.consumerId?.fullName || ''}
                                className="input-field bg-gray-100"
                                disabled
                            />
                        ) : (
                            <select
                                name="consumerId"
                                value={formData.consumerId}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="">Select Consumer</option>
                                {consumers.map((consumer) => (
                                    <option key={consumer._id} value={consumer._id}>
                                        {consumer.fullName} - {consumer.area}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>



                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Update Assignment' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Assignment"
                message={`Are you sure you want to remove the assignment for ${assignmentToDelete?.consumerId?.fullName}? This action cannot be undone.`}
            />
        </div>
    );
};

export default Assignments;
