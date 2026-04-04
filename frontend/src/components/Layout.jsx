import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Users, 
  Settings, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Sun, 
  Moon,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationHub from './NotificationHub';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { 
            to: "/employee", 
            label: "My Reservations", 
            icon: Calendar, 
            roles: ['EMPLOYEE'] 
        },
        { 
            to: "/manager", 
            label: "Team Management", 
            icon: Users, 
            roles: ['MANAGER'] 
        },
        { 
            to: "/admin", 
            label: "Administration", 
            icon: Settings, 
            roles: ['ADMIN'] 
        },
        { 
            to: "/admin/analytics", 
            label: "Analytics", 
            icon: PieChart, 
            roles: ['ADMIN'] 
        },
        { 
            to: "/profile", 
            label: "My Profile", 
            icon: User, 
            roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] 
        },
    ];

    return (
        <div className="dashboard-grid">
            <aside className="sidebar-modern animate-in">
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                        background: 'hsl(var(--primary))', 
                        padding: '0.5rem', 
                        borderRadius: '0.5rem',
                        color: 'white'
                    }}>
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>SmartPlanning</h2>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Workspace Manager</span>
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    {navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                        <NavLink 
                            key={item.to}
                            to={item.to} 
                            data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            className={({ isActive }) => `btn-ui ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ justifyContent: 'flex-start', width: '100%' }}
                        >
                            <item.icon size={18} strokeWidth={2} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}>
                    <button 
                        onClick={() => setIsDark(!isDark)} 
                        className="btn-ui btn-outline"
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{isDark ? 'Light' : 'Dark'} Mode</span>
                    </button>

                    <button 
                        onClick={handleLogout} 
                        className="btn-ui btn-ghost"
                        data-testid="logout-button"
                        style={{ width: '100%', justifyContent: 'flex-start', color: 'hsl(var(--destructive))' }}
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>

                    <div className="card-modern" data-testid="user-mini-profile" style={{ padding: '1rem', background: 'hsl(var(--muted) / 0.5)', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                                width: '2.5rem', 
                                height: '2.5rem', 
                                borderRadius: '999px', 
                                background: user?.profilePicture ? 'transparent' : 'hsl(var(--primary) / 0.1)',
                                color: 'hsl(var(--primary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}>
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user?.fullName?.charAt(0)?.toUpperCase()
                                )}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.fullName}
                                </div>
                                <div className="badge-ui badge-indigo" style={{ marginTop: '0.25rem', fontSize: '0.625rem' }}>
                                    {user?.role}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-scroll">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </main>
            <NotificationHub />
        </div>
    );
}
