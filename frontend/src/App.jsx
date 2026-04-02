import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalyticsDashboard from './pages/AdminAnalyticsDashboard';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
}

function HomeRedirect() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    switch (user.role) {
        case 'ADMIN': return <Navigate to="/admin" />;
        case 'MANAGER': return <Navigate to="/manager" />;
        default: return <Navigate to="/employee" />;
    }
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="/employee" element={
                        <ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
                            <Layout><EmployeeDashboard /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/manager" element={
                        <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
                            <Layout><ManagerDashboard /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['ADMIN']}>
                            <Layout><AdminDashboard /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/analytics" element={
                        <ProtectedRoute roles={['ADMIN']}>
                            <Layout><AdminAnalyticsDashboard /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
                            <Layout><Profile /></Layout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
