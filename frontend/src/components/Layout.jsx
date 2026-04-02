import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <h2>🏢 SmartOffice</h2>
                    <span>Reservation System</span>
                </div>

                <nav className="sidebar-nav">
                    {(user?.role === 'EMPLOYEE' || user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                        <NavLink to="/employee" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>📅</span> <span>My Reservations</span>
                        </NavLink>
                    )}
                    {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                        <NavLink to="/manager" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>👥</span> <span>Team Management</span>
                        </NavLink>
                    )}
                    {user?.role === 'ADMIN' && (
                        <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>⚙️</span> <span>Administration</span>
                        </NavLink>
                    )}
                    <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span>👤</span> <span>My Profile</span>
                    </NavLink>
                    <button onClick={handleLogout}>
                        <span>🚪</span> <span>Sign Out</span>
                    </button>
                </nav>

                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-name">{user?.fullName}</div>
                        <div className="user-role">{user?.role}</div>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
