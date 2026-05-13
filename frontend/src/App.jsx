import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalyticsDashboard from './pages/AdminAnalyticsDashboard';
import SecurityMonitor from './pages/SecurityMonitor';

import PerformanceAnalytics from './pages/PerformanceAnalytics';
import Profile from './pages/Profile';
import MeetingRoomBooking from './pages/MeetingRoomBooking';

import ForgotPassword from './pages/ForgotPassword';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import { useEffect } from 'react';
import { requestForToken, onMessageListener } from './firebase';
import { toast, Toaster } from 'react-hot-toast';

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
}

function HomeRedirect() {
    const { user } = useAuth();
    if (!user) return <LandingPage />;
    switch (user.role) {
        case 'ADMIN': return <Navigate to="/admin" />;
        case 'MANAGER': return <Navigate to="/manager" />;
        default: return <Navigate to="/employee" />;
    }
}

function App() {
    useEffect(() => {
        const setupNotifications = async () => {
            // Wait a bit for auth to initialize
            setTimeout(() => {
                const token = localStorage.getItem('token');
                if (token) {
                    requestForToken();
                }
            }, 2000);
        };

        setupNotifications();

        onMessageListener()
            .then((payload) => {
                console.log("Foreground notification: ", payload);
                toast.success(`${payload.notification.title}: ${payload.notification.body}`, {
                    duration: 6000,
                    position: 'top-right',
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155'
                    }
                });
            })
            .catch((err) => console.log('failed: ', err));
    }, []);

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/" element={<HomeRedirect />} />
                    
                    {/* Nested Layout Route for Authenticated Users */}
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/employee" element={
                            <ProtectedRoute roles={['EMPLOYEE']}>
                                <EmployeeDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/manager" element={
                            <ProtectedRoute roles={['MANAGER']}>
                                <ManagerDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/analytics" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminAnalyticsDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/security" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <SecurityMonitor />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/performance" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <PerformanceAnalytics />
                            </ProtectedRoute>
                        } />
                        <Route path="/meeting-rooms" element={
                            <ProtectedRoute roles={['EMPLOYEE']}>
                                <MeetingRoomBooking />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
                                <Profile />
                            </ProtectedRoute>
                        } />
                    </Route>
                </Routes>
            </BrowserRouter>
            <Toaster />
        </AuthProvider>
    );
}

export default App;
