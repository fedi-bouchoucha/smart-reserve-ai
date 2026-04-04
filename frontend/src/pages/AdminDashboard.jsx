import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Plus, 
  RefreshCcw, 
  Trash2, 
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('users');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // User form
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '', password: '', fullName: '', email: '', role: 'EMPLOYEE', managerId: ''
    });

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        loadStats();
        loadUsers();
    }, []);

    const loadStats = async () => {
        try {
            const res = await api.get('/admin/statistics');
            setStats(res.data);
        } catch (e) { console.error(e); }
    };

    const loadUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (e) { console.error(e); }
    };

    const loadReservations = async () => {
        try {
            const res = await api.get('/admin/reservations');
            setReservations(res.data);
        } catch (e) { console.error(e); }
    };

    const loadChangeRequests = async () => {
        try {
            const res = await api.get('/admin/change-requests');
            setChangeRequests(res.data);
        } catch (e) { console.error(e); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setMessage({ type: 'success', text: 'User deleted successfully' });
            loadUsers();
            loadStats();
        } catch (e) { setMessage({ type: 'error', text: 'Delete failed' }); }
    };

    const handleDeleteReservation = async (id) => {
        if (!window.confirm('Cancel this reservation globally?')) return;
        try {
            await api.delete(`/admin/reservations/${id}`);
            setMessage({ type: 'success', text: 'Reservation cancelled' });
            loadReservations();
            loadStats();
        } catch (e) { setMessage({ type: 'error', text: 'Failed to cancel' }); }
    };

    const handleDeleteChangeRequest = async (id) => {
        if (!window.confirm('Delete this change request?')) return;
        try {
            await api.delete(`/admin/change-requests/${id}`);
            setMessage({ type: 'success', text: 'Request deleted' });
            loadChangeRequests();
        } catch (e) { setMessage({ type: 'error', text: 'Delete failed' }); }
    };

    const handleSaveUser = async () => {
        setLoading(true);
        try {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser.id}`, userForm);
                setMessage({ type: 'success', text: 'User updated successfully' });
            } else {
                await api.post('/admin/users', userForm);
                setMessage({ type: 'success', text: 'User created successfully' });
            }
            setShowUserModal(false);
            setEditingUser(null);
            resetForm();
            loadUsers();
            loadStats();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Operation failed' });
        }
        setLoading(false);
    };

    const resetForm = () => {
        setUserForm({ username: '', password: '', fullName: '', email: '', role: 'EMPLOYEE', managerId: '' });
    };

    const filteredUsers = users.filter(u => 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>System Administration</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>Global oversight and resource control</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-ui btn-outline" onClick={() => { loadStats(); loadUsers(); }}>
                        <RefreshCcw size={18} />
                        <span>Refresh</span>
                    </button>
                    <button className="btn-ui btn-primary" onClick={() => navigate('/admin/analytics')}>
                        <BarChart3 size={18} />
                        <span>Analytics</span>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`alert alert-${message.type}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span style={{ flex: 1 }}>{message.text}</span>
                        <X size={18} style={{ cursor: 'pointer' }} onClick={() => setMessage({ type: '', text: '' })} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                  { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'primary' },
                  { label: 'Active Reservations', value: stats?.totalReservations || 0, icon: Calendar, color: 'success' },
                  { label: 'Pending Requests', value: stats?.totalChangeRequests || 0, icon: MessageSquare, color: 'warning' }
                ].map((stat, i) => (
                    <div key={i} className="card-modern" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ 
                            background: `hsl(var(--${stat.color}) / 0.1)`, 
                            padding: '0.75rem', 
                            borderRadius: '0.75rem',
                            color: `hsl(var(--${stat.color}))`
                        }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="tabs" style={{ marginBottom: '1.5rem' }}>
                <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => { setTab('users'); loadUsers(); }}>
                    <Users size={16} /> <span>Users</span>
                </button>
                <button className={`tab-btn ${tab === 'reservations' ? 'active' : ''}`} onClick={() => { setTab('reservations'); loadReservations(); }}>
                    <Calendar size={16} /> <span>Reservations</span>
                </button>
                <button className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} onClick={() => { setTab('requests'); loadChangeRequests(); }}>
                    <MessageSquare size={16} /> <span>Requests</span>
                </button>
            </div>

            <div className="card-modern" style={{ padding: 0, overflow: 'hidden' }}>
                {tab === 'users' && (
                    <>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                                <input 
                                    className="input-modern" 
                                    placeholder="Search users..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                            <button className="btn-ui btn-primary" onClick={() => { setEditingUser(null); resetForm(); setShowUserModal(true); }}>
                                <Plus size={18} />
                                <span>Create User</span>
                            </button>
                        </div>
                        <table className="table-ui">
                            <thead>
                                <tr><th>Full Name / Username</th><th>Role</th><th>Email Address</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>@{u.username}</div>
                                        </td>
                                        <td>
                                            <div className={`badge-ui ${u.role === 'ADMIN' ? 'badge-indigo' : 'badge-warning'}`}>
                                                {u.role}
                                            </div>
                                        </td>
                                        <td style={{ color: 'hsl(var(--muted-foreground))' }}>{u.email}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button className="btn-ui btn-ghost btn-sm" onClick={() => { setEditingUser(u); setUserForm(u); setShowUserModal(true); }}>
                                                    <Edit3 size={16} />
                                                </button>
                                                <button className="btn-ui btn-ghost btn-sm" style={{ color: 'hsl(var(--destructive))' }} onClick={() => handleDeleteUser(u.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {tab === 'reservations' && (
                    <table className="table-ui">
                        <thead>
                            <tr><th>User</th><th>Resource</th><th>Date</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                        </thead>
                        <tbody>
                            {reservations.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 500 }}>{r.userName}</td>
                                    <td>
                                        <div className="badge-ui badge-indigo">
                                            {r.chairId ? '🪑 Desk' : '🏢 Room'}
                                        </div>
                                    </td>
                                    <td>{r.date}</td>
                                    <td><div className={`badge-ui ${r.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>{r.status}</div></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-ui btn-ghost btn-sm" style={{ color: 'hsl(var(--destructive))' }} onClick={() => handleDeleteReservation(r.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {tab === 'requests' && (
                    <table className="table-ui">
                        <thead>
                            <tr><th>Requested By</th><th>From</th><th>To</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                        </thead>
                        <tbody>
                            {changeRequests.map(cr => (
                                <tr key={cr.id}>
                                    <td style={{ fontWeight: 500 }}>{cr.requestedBy}</td>
                                    <td>{cr.reservationDate}</td>
                                    <td style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>{cr.newDate}</td>
                                    <td>
                                        <div className={`badge-ui ${cr.status === 'PENDING' ? 'badge-warning' : cr.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                                            {cr.status}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-ui btn-ghost btn-sm" style={{ color: 'hsl(var(--destructive))' }} onClick={() => handleDeleteChangeRequest(cr.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AnimatePresence>
                {showUserModal && (
                    <div className="modal-overlay modal-modern-overlay" onClick={() => setShowUserModal(false)}>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-content modal-modern-content" 
                            onClick={e => e.stopPropagation()} 
                            style={{ maxWidth: '500px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem' }}>{editingUser ? 'Update User Identity' : 'Register New User'}</h2>
                                <X size={20} style={{ cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} onClick={() => setShowUserModal(false)} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="input-modern" value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <input className="input-modern" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} required disabled={!!editingUser} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input className="input-modern" type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                            </div>

                            {!editingUser && (
                                <div className="form-group">
                                    <label className="form-label">Initial Password</label>
                                    <input className="input-modern" type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">System Role</label>
                                <select className="input-modern" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                    <option value="EMPLOYEE">Standard Employee</option>
                                    <option value="MANAGER">Team Manager</option>
                                    <option value="ADMIN">System Administrator</option>
                                </select>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '2.5rem' }}>
                                <button className="btn-ui btn-ghost" onClick={() => setShowUserModal(false)}>Cancel</button>
                                <button className="btn-ui btn-primary" onClick={handleSaveUser}>
                                    {loading ? 'Processing...' : 'Save User Profile'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
