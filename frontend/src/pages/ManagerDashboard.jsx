import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ManagerDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('requests');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [commentModal, setCommentModal] = useState(null); // { id, action }
    const [comment, setComment] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [reqRes, empRes] = await Promise.all([
                api.get('/manager/change-requests'),
                api.get('/manager/employees')
            ]);
            setPendingRequests(reqRes.data);
            setEmployees(empRes.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleAction = async () => {
        if (!commentModal) return;
        setLoading(true);
        try {
            await api.post(`/manager/change-requests/${commentModal.id}/${commentModal.action}`, {
                comment: comment
            });
            setMessage({
                type: 'success',
                text: `Request ${commentModal.action === 'approve' ? 'approved' : 'rejected'} successfully!`
            });
            setCommentModal(null);
            setComment('');
            loadData();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Action failed' });
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="page-header">
                <h1>Team Management</h1>
                <p>Review change requests and manage your team, {user?.fullName}.</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{pendingRequests.length}</div>
                    <div className="stat-label">Pending Requests</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{employees.length}</div>
                    <div className="stat-label">Team Members</div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
                    Change Requests
                </button>
                <button className={`tab-btn ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')}>
                    My Team
                </button>
            </div>

            {/* PENDING REQUESTS */}
            {tab === 'requests' && (
                <div className="card">
                    <div className="card-header">
                        <h3>📨 Pending Change Requests</h3>
                        <button className="btn btn-secondary btn-sm" onClick={loadData}>Refresh</button>
                    </div>
                    {pendingRequests.length === 0 ? (
                        <div className="empty-state">
                            <h3>No pending requests</h3>
                            <p>All change requests have been handled</p>
                        </div>
                    ) : (
                        <div className="table-container" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Original Date</th>
                                        <th>Requested Date</th>
                                        <th>New Chair</th>
                                        <th>New Room</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRequests.map(cr => (
                                        <tr key={cr.id}>
                                            <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cr.requestedBy}</td>
                                            <td>{cr.reservationDate}</td>
                                            <td>{cr.newDate || '—'}</td>
                                            <td>{cr.newChairId || '—'}</td>
                                            <td>{cr.newMeetingRoomId || '—'}</td>
                                            <td>
                                                <div className="actions-row">
                                                    <button className="btn btn-success btn-sm" onClick={() => {
                                                        setCommentModal({ id: cr.id, action: 'approve' });
                                                        setComment('');
                                                    }}>
                                                        ✓ Approve
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => {
                                                        setCommentModal({ id: cr.id, action: 'reject' });
                                                        setComment('');
                                                    }}>
                                                        ✗ Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TEAM MEMBERS */}
            {tab === 'team' && (
                <div className="card">
                    <div className="card-header">
                        <h3>👥 My Team</h3>
                    </div>
                    {employees.length === 0 ? (
                        <div className="empty-state">
                            <h3>No team members</h3>
                            <p>No employees are assigned to you</p>
                        </div>
                    ) : (
                        <div className="table-container" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id}>
                                            <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{emp.fullName}</td>
                                            <td>{emp.username}</td>
                                            <td>{emp.email}</td>
                                            <td><span className="badge badge-info">{emp.role}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* COMMENT MODAL */}
            {commentModal && (
                <div className="modal-overlay" onClick={() => setCommentModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>{commentModal.action === 'approve' ? '✓ Approve' : '✗ Reject'} Request</h2>
                        <div className="form-group">
                            <label>Comment (optional)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                placeholder="Add a comment for the employee..."
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setCommentModal(null)}>Cancel</button>
                            <button
                                className={`btn ${commentModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                onClick={handleAction}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : commentModal.action === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
