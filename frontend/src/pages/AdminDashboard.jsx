import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // User form
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '', password: '', fullName: '', email: '', role: 'EMPLOYEE', managerId: ''
    });

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
            setMessage({ type: 'success', text: 'User deleted' });
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
                setMessage({ type: 'success', text: 'User updated' });
            } else {
                await api.post('/admin/users', userForm);
                setMessage({ type: 'success', text: 'User created' });
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

    const managers = users.filter(u => u.role === 'MANAGER');

    return (
        <div className="admin-dashboard">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Administration</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>System oversight and global data control</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => { loadStats(); loadUsers(); }}>🔄 Refresh</button>
                    <button className="btn btn-primary" onClick={() => navigate('/admin/analytics')}>📊 Analytics</button>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ marginBottom: '24px' }}>
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold' }}>×</button>
                </div>
            )}

            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <div className="stat-card">
                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                    <div className="stat-label">Total Registered Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.totalReservations || 0}</div>
                    <div className="stat-label">Total Reservations</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.totalChangeRequests || 0}</div>
                    <div className="stat-label">Pending Change Requests</div>
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: '24px' }}>
                <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => { setTab('users'); loadUsers(); }}>Users</button>
                <button className={`tab-btn ${tab === 'reservations' ? 'active' : ''}`} onClick={() => { setTab('reservations'); loadReservations(); }}>Reservations</button>
                <button className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} onClick={() => { setTab('requests'); loadChangeRequests(); }}>Change Requests</button>
            </div>

            {tab === 'users' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                        <h3>👤 User Accounts</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => { setEditingUser(null); resetForm(); setShowUserModal(true); }}>+ New User</button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Name</th><th>Username</th><th>Role</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: '600' }}>{u.fullName}</td>
                                        <td>{u.username}</td>
                                        <td><span className="badge badge-info">{u.role}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => { setEditingUser(u); setUserForm(u); setShowUserModal(true); }}>Edit</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'reservations' && (
                <div className="card">
                    <div className="card-header" style={{ padding: '20px' }}>
                        <h3>📅 Global Reservations</h3>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>User</th><th>Resource</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {reservations.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.userName}</td>
                                        <td>{r.chairId ? '🪑 Chair' : '🏢 Room'}</td>
                                        <td>{r.date}</td>
                                        <td><span className={`badge badge-${r.status === 'CONFIRMED' ? 'success' : 'warning'}`}>{r.status}</span></td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteReservation(r.id)}>Cancel</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'requests' && (
                <div className="card">
                    <div className="card-header" style={{ padding: '20px' }}>
                        <h3>📨 System Change Requests</h3>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>User</th><th>Original Date</th><th>Requested Date</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {changeRequests.map(cr => (
                                    <tr key={cr.id}>
                                        <td>{cr.requestedBy}</td>
                                        <td>{cr.reservationDate}</td>
                                        <td>{cr.newDate || '—'}</td>
                                        <td><span className={`badge badge-${cr.status === 'PENDING' ? 'warning' : cr.status === 'APPROVED' ? 'success' : 'danger'}`}>{cr.status}</span></td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteChangeRequest(cr.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Modal */}
            {showUserModal && (
                <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label>Full Name</label>
                            <input type="text" value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label>Username</label>
                            <input type="text" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} required disabled={editingUser} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label>Email</label>
                            <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                        </div>
                        {!editingUser && (
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label>Password</label>
                                <input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required />
                            </div>
                        )}
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label>Role</label>
                            <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '24px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveUser}>{loading ? 'Saving...' : 'Save User'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
