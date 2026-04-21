import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ClipboardCheck, 
  Users, 
  RefreshCcw, 
  CheckCircle2, 
  XSquare, 
  MessageSquare,
  Search,
  User,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  Trash2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManagerDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('requests');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [deskApprovals, setDeskApprovals] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [commentModal, setCommentModal] = useState(null); // { id, action }
    const [selectedEmployee, setSelectedEmployee] = useState(null); // { id, fullName }
    const [empReservations, setEmpReservations] = useState([]);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [reqRes, empRes, deskRes] = await Promise.all([
                api.get('/manager/change-requests'),
                api.get('/manager/employees'),
                api.get('/manager/pending-approvals')
            ]);
            setPendingRequests(reqRes.data);
            setEmployees(empRes.data);
            setDeskApprovals(deskRes.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const loadEmployeeReservations = async (emp) => {
        setLoading(true);
        setSelectedEmployee(emp);
        try {
            const res = await api.get(`/manager/employees/${emp.id}/reservations`);
            setEmpReservations(res.data);
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to load reservations' });
        }
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

    const handleDeskApproval = async (id, action) => {
        setLoading(true);
        try {
            await api.post(`/manager/reservations/${id}/${action}`);
            setMessage({
                type: 'success',
                text: `Desk reservation ${action === 'approve' ? 'approved' : 'rejected'} successfully!`
            });
            loadData();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Action failed' });
        }
        setLoading(false);
    };

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Team Management</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>Review presence changes and manage your squad, {user?.fullName}.</p>
                </div>
                <button className="btn-ui btn-outline" onClick={loadData}>
                    <RefreshCcw size={18} />
                    <span>Sync Team Data</span>
                </button>
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
                <div className="card-modern" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'hsl(var(--warning) / 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'hsl(var(--warning))' }}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{deskApprovals.length}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Late Bookings</div>
                    </div>
                </div>
                <div className="card-modern" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} data-testid="pending-requests-card">
                    <div style={{ background: 'hsl(var(--primary) / 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'hsl(var(--primary))' }}>
                        <ClipboardCheck size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }} data-testid="pending-requests-count">{pendingRequests.length}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Change Req.</div>
                    </div>
                </div>
                <div className="card-modern" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'hsl(var(--success) / 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'hsl(var(--success))' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{employees.length}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Direct Reports</div>
                    </div>
                </div>
            </div>

            <div className="tabs" style={{ marginBottom: '1.5rem' }}>
                <button className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')} data-testid="tab-requests">
                    <ClipboardCheck size={16} /> <span>Change Requests</span>
                </button>
                <button className={`tab-btn ${tab === 'desk-approvals' ? 'active' : ''}`} onClick={() => setTab('desk-approvals')} data-testid="tab-desk-approvals">
                    <Calendar size={16} /> <span>Late Bookings</span>
                </button>
                <button className={`tab-btn ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')} data-testid="tab-team">
                    <Users size={16} /> <span>My Team</span>
                </button>
            </div>

            <div className="card-modern" style={{ padding: 0, overflow: 'hidden' }}>
                {tab === 'requests' && (
                    <>
                        {pendingRequests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <div style={{ background: 'hsl(var(--secondary))', width: '64px', height: '64px', borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>All Clear!</h3>
                                <p style={{ color: 'hsl(var(--muted-foreground))' }}>No pending change requests to review.</p>
                            </div>
                        ) : (
                            <table className="table-ui">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Current Date</th>
                                        <th>Requested Date</th>
                                        <th>Target Resource</th>
                                        <th style={{ textAlign: 'right' }}>Decide</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRequests.map(cr => (
                                        <tr key={cr.id}>
                                            <td style={{ fontWeight: 600 }}>{cr.requestedBy}</td>
                                            <td><div className="badge-ui" style={{ background: 'hsl(var(--muted) / 0.5)' }}>{cr.reservationDate}</div></td>
                                            <td><div className="badge-ui badge-indigo" style={{ fontWeight: 700 }}>{cr.newDate || '—'}</div></td>
                                            <td>
                                                <div style={{ fontSize: '0.875rem' }}>
                                                    {cr.newChairId ? `🪑 Desk ${cr.newChairId}` : cr.newMeetingRoomId ? `🏢 Room ${cr.newMeetingRoomId}` : '—'}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button className="btn-ui btn-primary btn-sm" 
                                                        onClick={() => setCommentModal({ id: cr.id, action: 'approve' })}
                                                        data-testid={`approve-btn-${cr.id}`}
                                                    >
                                                        <Check size={16} />
                                                        <span>Approve</span>
                                                    </button>
                                                    <button className="btn-ui btn-outline btn-sm" 
                                                        style={{ color: 'hsl(var(--destructive))' }} 
                                                        onClick={() => setCommentModal({ id: cr.id, action: 'reject' })}
                                                        data-testid={`reject-btn-${cr.id}`}
                                                    >
                                                        <X size={16} />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {tab === 'desk-approvals' && (
                    <>
                        {deskApprovals.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <div style={{ background: 'hsl(var(--secondary))', width: '64px', height: '64px', borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'hsl(var(--muted-foreground))' }}><CheckCircle2 size={32} /></div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>All Clear!</h3>
                                <p style={{ color: 'hsl(var(--muted-foreground))' }}>No pending late desk bookings to review.</p>
                            </div>
                        ) : (
                            <table className="table-ui">
                                <thead>
                                    <tr><th>Employee</th><th>Date Requested</th><th>Desk</th><th style={{ textAlign: 'right' }}>Decide</th></tr>
                                </thead>
                                <tbody>
                                    {deskApprovals.map(da => (
                                        <tr key={da.id}>
                                            <td style={{ fontWeight: 600 }}>{da.userName}</td>
                                            <td><div className="badge-ui" style={{ background: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))', fontWeight: 700 }}>{da.date}</div></td>
                                            <td><div style={{ fontSize: '0.875rem' }}>🪑 {da.chairInfo}</div></td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button className="btn-ui btn-primary btn-sm" onClick={() => handleDeskApproval(da.id, 'approve')}><Check size={16} /><span>Approve</span></button>
                                                    <button className="btn-ui btn-outline btn-sm" style={{ color: 'hsl(var(--destructive))' }} onClick={() => handleDeskApproval(da.id, 'reject')}><X size={16} /><span>Reject</span></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {tab === 'team' && (
                    <table className="table-ui">
                        <thead>
                            <tr>
                                <th>Name / Username</th>
                                <th>Email Address</th>
                                <th>Role</th>
                                <th style={{ textAlign: 'right' }}>Overview</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '99px', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                                {emp.fullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>@{emp.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'hsl(var(--muted-foreground))' }}>{emp.email}</td>
                                    <td><div className="badge-ui" style={{ background: 'hsl(var(--secondary))' }}>{emp.role}</div></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-ui btn-ghost btn-sm" onClick={() => loadEmployeeReservations(emp)}>
                                            <span>View Logs</span>
                                            <ChevronRight size={14} />
                                        </button>
                                        <button className="btn-ui btn-outline btn-sm" onClick={() => loadEmployeeReservations(emp)} style={{ marginLeft: '0.5rem' }}>
                                            <Calendar size={14} />
                                            <span>Reservations</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AnimatePresence>
                {selectedEmployee && (
                    <div className="modal-overlay modal-modern-overlay" onClick={() => setSelectedEmployee(null)}>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-content modal-modern-content" 
                            onClick={e => e.stopPropagation()} 
                            style={{ maxWidth: '600px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem' }}>Reservations: {selectedEmployee.fullName}</h2>
                                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Manage individual bookings for this team member.</p>
                                </div>
                                <X size={20} style={{ cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} onClick={() => setSelectedEmployee(null)} />
                            </div>

                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {empReservations.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>No active reservations found.</div>
                                ) : (
                                    <table className="table-ui">
                                        <thead>
                                            <tr><th>Date</th><th>Resource</th></tr>
                                        </thead>
                                        <tbody>
                                            {empReservations.map(r => (
                                                <tr key={r.id}>
                                                    <td>{r.date}</td>
                                                    <td>
                                                        <div className="badge-ui badge-indigo">
                                                            {r.chairId ? '🪑 Desk' : '🏢 Room'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="modal-actions" style={{ marginTop: '2rem' }}>
                                <button className="btn-ui btn-primary" onClick={() => setSelectedEmployee(null)}>Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {commentModal && (
                    <div className="modal-overlay modal-modern-overlay" onClick={() => setCommentModal(null)}>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-content modal-modern-content" 
                            onClick={e => e.stopPropagation()} 
                            style={{ maxWidth: '440px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ 
                                    background: `hsl(var(--${commentModal.action === 'approve' ? 'success' : 'destructive'}) / 0.1)`, 
                                    padding: '0.75rem', 
                                    borderRadius: '0.75rem',
                                    color: `hsl(var(--${commentModal.action === 'approve' ? 'success' : 'destructive'}))`
                                }}>
                                    {commentModal.action === 'approve' ? <CheckCircle2 size={24} /> : <XSquare size={24} />}
                                </div>
                                <h2 style={{ fontSize: '1.25rem' }}>{commentModal.action === 'approve' ? 'Approve' : 'Reject'} Request</h2>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MessageSquare size={14} />
                                    <span>Decision Feedback (Optional)</span>
                                </label>
                                <textarea
                                    className="input-modern"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    placeholder="Explain your decision to the employee..."
                                    style={{ resize: 'none' }}
                                />
                            </div>

                            <div className="modal-actions" style={{ marginTop: '2rem' }}>
                                <button className="btn-ui btn-ghost" onClick={() => setCommentModal(null)}>Cancel</button>
                                <button
                                    className={`btn-ui ${commentModal.action === 'approve' ? 'btn-primary' : 'btn-danger'}`}
                                    onClick={handleAction}
                                    data-testid="confirm-decision-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : `Confirm ${commentModal.action}`}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ChevronRight({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}
