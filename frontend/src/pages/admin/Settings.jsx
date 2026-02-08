import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ErrorAlert from '../../components/common/ErrorAlert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [defaultMilkRate, setDefaultMilkRate] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setDefaultMilkRate(response.data.data.defaultMilkRate);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch settings');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (parseFloat(defaultMilkRate) <= 0) {
            setError('Rate must be greater than 0');
            return;
        }

        try {
            setSaving(true);
            await api.put('/settings', {
                defaultMilkRate: parseFloat(defaultMilkRate)
            });
            setSuccess('Settings updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Failed to update settings');
        } finally {
            setSaving(false);
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
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600 mt-1">Manage system settings</p>
            </div>

            {error && <ErrorAlert message={error} type="error" onClose={() => setError('')} />}
            {success && <ErrorAlert message={success} type="success" onClose={() => setSuccess('')} />}

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Milk Rate (₹ per Liter)
                        </label>
                        <input
                            type="number"
                            value={defaultMilkRate}
                            onChange={(e) => setDefaultMilkRate(e.target.value)}
                            className="input-field"
                            step="0.01"
                            min="0"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            This rate will be auto-filled when creating new consumers
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary disabled:opacity-50"
                        >
                            {saving ? <LoadingSpinner size="sm" /> : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
