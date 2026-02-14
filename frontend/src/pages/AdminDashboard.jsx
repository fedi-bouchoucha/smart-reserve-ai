import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);
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

    const handleSaveUser = async () => {
        setLoading(true);
        try {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser.id}`, userForm);
                setMessage({ type: 'success', text: 'User updated successfully!' });
            } else {
                await api.post('/admin/users', userForm);
                setMessage({ type: 'success', text: 'User created successfully!' });
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

    const handleDeleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setMessage({ type: 'success', text: 'User deleted' });
            loadUsers();
            loadStats();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Delete failed' });
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setUserForm({
            username: user.username,
            password: '',
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            managerId: user.managerId || ''
        });
        setShowUserModal(true);
    };

    const resetForm = () => {
        setUserForm({ username: '', password: '', fullName: '', email: '', role: 'EMPLOYEE', managerId: '' });
    };

    const managers = users.filter(u => u.role === 'MANAGER');

    return (
        <div>
            <div className="page-header">
                <h1>Administration</h1>
                <p>System overview and user management</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                </div>
            )}

            <div className="tabs">
                <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => { setTab('stats'); loadStats(); }}>
                    Statistics
                </button>
                <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => { setTab('users'); loadUsers(); }}>
                    Users
                </button>
                <button className={`tab-btn ${tab === 'reservations' ? 'active' : ''}`} onClick={() => { setTab('reservations'); loadReservations(); }}>
                    Reservations
                </button>
            </div>

            {/* STATISTICS */}
            {tab === 'stats' && stats && (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value" style={{ background: 'var(--gradient-1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {stats.totalUsers}
                            </div>
                            <div className="stat-label">Total Users</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalEmployees}</div>
                            <div className="stat-label">Employees</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalManagers}</div>
                            <div className="stat-label">Managers</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalReservations}</div>
                            <div className="stat-label">Total Reservations</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.todayOccupancy}</div>
                            <div className="stat-label">Today's Occupancy</div>
                        </div>
                        <div className={`stat-card ${!stats.todayMeetsMinimum ? 'warning' : ''}`}>
                            <div className="stat-value">{stats.todayMeetsMinimum ? '✓' : '✗'}</div>
                            <div className="stat-label">Min 25% Met Today</div>
                        </div>
                    </div>

                    {stats.weeklyOccupancy && (
                        <div className="card" style={{ marginTop: '20px' }}>
                            <div className="card-header">
                                <h3>📊 Weekly Occupancy</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {Object.entries(stats.weeklyOccupancy).map(([day, count]) => (
                                    <div key={day} style={{
                                        flex: '1', minWidth: '100px', textAlign: 'center',
                                        padding: '16px', background: 'var(--bg-secondary)',
                                        borderRadius: '8px', border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{count}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                            {day.toLowerCase().slice(0, 3)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* USERS */}
            {tab === 'users' && (
                <div className="card">
                    <div className="card-header">
                        <h3>👤 User Management</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => {
                            setEditingUser(null);
                            resetForm();
                            setShowUserModal(true);
                        }}>
                            + Add User
                        </button>
                    </div>
                    <div className="table-container" style={{ border: 'none' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Manager</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.fullName}</td>
                                        <td>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`badge badge-${u.role === 'ADMIN' ? 'danger' :
                                                    u.role === 'MANAGER' ? 'warning' : 'info'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>{u.managerName || '—'}</td>
                                        <td>
                                            <div className="actions-row">
                                                <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(u)}>Edit</button>
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

            {/* RESERVATIONS */}
            {tab === 'reservations' && (
                <div className="card">
                    <div className="card-header">
                        <h3>📅 All Reservations</h3>
                        <button className="btn btn-secondary btn-sm" onClick={loadReservations}>Refresh</button>
                    </div>
                    {reservations.length === 0 ? (
                        <div className="empty-state">
                            <h3>No reservations</h3>
                        </div>
                    ) : (
                        <div className="table-container" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Employee</th>
                                        <th>Date</th>
                                        <th>Resource</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map(r => (
                                        <tr key={r.id}>
                                            <td>{r.id}</td>
                                            <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.userName}</td>
                                            <td>{r.date}</td>
                                            <td>{r.chairInfo || r.meetingRoomName}</td>
                                            <td><span className={`badge badge-${r.status === 'CONFIRMED' ? 'success' : 'warning'}`}>{r.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* USER MODAL */}
            {showUserModal && (
                <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={userForm.fullName}
                                onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} />
                        </div>
                        {!editingUser && (
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" value={userForm.username}
                                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} />
                            </div>
                        )}
                        <div className="form-group">
                            <label>{editingUser ? 'New Password (leave empty to keep)' : 'Password'}</label>
                            <input type="password" value={userForm.password}
                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={userForm.email}
                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select value={userForm.role}
                                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        {userForm.role === 'EMPLOYEE' && (
                            <div className="form-group">
                                <label>Assign Manager</label>
                                <select value={userForm.managerId}
                                    onChange={(e) => setUserForm({ ...userForm, managerId: e.target.value })}>
                                    <option value="">No Manager</option>
                                    {managers.map(m => (
                                        <option key={m.id} value={m.id}>{m.fullName}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveUser} disabled={loading}>
                                {loading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
