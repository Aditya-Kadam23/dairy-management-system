import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './components/admin/AdminLayout';
import EmployeeLayout from './components/employee/EmployeeLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Consumers from './pages/admin/Consumers';
import Employees from './pages/admin/Employees';
import Assignments from './pages/admin/Assignments';
import DailyMilk from './pages/admin/DailyMilk';
import Deliveries from './pages/admin/Deliveries';
import Billing from './pages/admin/Billing';
import Settings from './pages/admin/Settings';
import MyAssignments from './pages/employee/MyAssignments';
import MyDeliveries from './pages/employee/MyDeliveries';

const DefaultRedirect = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/employee/deliveries" replace />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="consumers" element={<Consumers />} />
                        <Route path="employees" element={<Employees />} />
                        <Route path="assignments" element={<Assignments />} />
                        <Route path="daily-milk" element={<DailyMilk />} />
                        <Route path="deliveries" element={<Deliveries />} />
                        <Route path="billing" element={<Billing />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Employee Routes */}
                    <Route
                        path="/employee"
                        element={
                            <ProtectedRoute allowedRoles={['employee']}>
                                <EmployeeLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="assignments" element={<MyAssignments />} />
                        <Route path="deliveries" element={<MyDeliveries />} />
                    </Route>

                    {/* Default Route */}
                    <Route path="/" element={<DefaultRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
