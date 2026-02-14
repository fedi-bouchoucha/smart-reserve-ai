import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('reservations');
    const [reservations, setReservations] = useState([]);
    const [chairs, setChairs] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedChair, setSelectedChair] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [resourceType, setResourceType] = useState('chair');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Change request modal
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [changeReservation, setChangeReservation] = useState(null);
    const [changeDate, setChangeDate] = useState('');
    const [changeChairId, setChangeChairId] = useState('');
    const [changeRoomId, setChangeRoomId] = useState('');

    useEffect(() => {
        loadReservations();
        loadChangeRequests();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            loadAvailability();
        }
    }, [selectedDate]);

    const loadReservations = async () => {
        try {
            const res = await api.get('/reservations/my');
            setReservations(res.data);
        } catch (e) { console.error(e); }
    };

    const loadChangeRequests = async () => {
        try {
            const res = await api.get('/change-requests/my');
            setChangeRequests(res.data);
        } catch (e) { console.error(e); }
    };

    const loadAvailability = async () => {
        try {
            const [chairRes, roomRes] = await Promise.all([
                api.get(`/reservations/available/chairs/${selectedDate}`),
                api.get(`/reservations/available/rooms/${selectedDate}`)
            ]);
            setChairs(chairRes.data);
            setRooms(roomRes.data);
        } catch (e) { console.error(e); }
    };

    const handleReserve = async () => {
        if (!selectedDate) {
            setMessage({ type: 'error', text: 'Please select a date' });
            return;
        }
        if (resourceType === 'chair' && !selectedChair) {
            setMessage({ type: 'error', text: 'Please select a chair' });
            return;
        }
        if (resourceType === 'room' && !selectedRoom) {
            setMessage({ type: 'error', text: 'Please select a meeting room' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/reservations', {
                date: selectedDate,
                chairId: resourceType === 'chair' ? selectedChair : null,
                meetingRoomId: resourceType === 'room' ? selectedRoom : null
            });
            setMessage({ type: 'success', text: 'Reservation created successfully!' });
            setSelectedChair(null);
            setSelectedRoom(null);
            loadReservations();
            loadAvailability();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to create reservation' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRequest = async () => {
        setLoading(true);
        try {
            await api.post('/change-requests', {
                reservationId: changeReservation.id,
                newDate: changeDate || null,
                newChairId: changeChairId ? parseInt(changeChairId) : null,
                newMeetingRoomId: changeRoomId ? parseInt(changeRoomId) : null
            });
            setMessage({ type: 'success', text: 'Change request submitted for manager approval!' });
            setShowChangeModal(false);
            loadChangeRequests();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to submit change request' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>My Workspace</h1>
                <p>Welcome back, {user?.fullName}. Manage your office reservations.</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                </div>
            )}

            <div className="tabs">
                <button className={`tab-btn ${tab === 'reservations' ? 'active' : ''}`} onClick={() => setTab('reservations')}>
                    My Reservations
                </button>
                <button className={`tab-btn ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>
                    New Reservation
                </button>
                <button className={`tab-btn ${tab === 'changes' ? 'active' : ''}`} onClick={() => setTab('changes')}>
                    Change Requests
                </button>
            </div>

            {/* MY RESERVATIONS */}
            {tab === 'reservations' && (
                <div className="card">
                    <div className="card-header">
                        <h3>📋 My Reservations</h3>
                    </div>
                    {reservations.length === 0 ? (
                        <div className="empty-state">
                            <h3>No reservations yet</h3>
                            <p>Create a new reservation to get started</p>
                        </div>
                    ) : (
                        <div className="table-container" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Resource</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map(r => (
                                        <tr key={r.id}>
                                            <td>{r.date}</td>
                                            <td>{r.chairInfo || r.meetingRoomName}</td>
                                            <td><span className={`badge badge-${r.status === 'CONFIRMED' ? 'success' : 'warning'}`}>{r.status}</span></td>
                                            <td>
                                                <button className="btn btn-secondary btn-sm" onClick={() => {
                                                    setChangeReservation(r);
                                                    setChangeDate(r.date);
                                                    setShowChangeModal(true);
                                                }}>
                                                    Request Change
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* NEW RESERVATION */}
            {tab === 'new' && (
                <div className="card">
                    <div className="card-header">
                        <h3>➕ New Reservation</h3>
                        <span className="badge badge-info">Reserve between 20th-28th of month</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={selectedDate} onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setSelectedChair(null);
                                setSelectedRoom(null);
                            }} />
                        </div>
                        <div className="form-group">
                            <label>Resource Type</label>
                            <select value={resourceType} onChange={(e) => {
                                setResourceType(e.target.value);
                                setSelectedChair(null);
                                setSelectedRoom(null);
                            }}>
                                <option value="chair">Office Chair</option>
                                <option value="room">Meeting Room</option>
                            </select>
                        </div>
                    </div>

                    {selectedDate && resourceType === 'chair' && (
                        <>
                            <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                Available Chairs ({chairs.length})
                            </h4>
                            {chairs.length === 0 ? (
                                <div className="empty-state"><p>No chairs available for this date</p></div>
                            ) : (
                                <div className="availability-grid">
                                    {chairs.map(c => (
                                        <div key={c.id}
                                            className={`resource-card ${selectedChair === c.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedChair(c.id)}>
                                            <h4>🪑 Chair {c.number}</h4>
                                            <p>{c.emplacementName} · Floor {c.floor}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {selectedDate && resourceType === 'room' && (
                        <>
                            <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                Available Meeting Rooms ({rooms.length})
                            </h4>
                            {rooms.length === 0 ? (
                                <div className="empty-state"><p>No meeting rooms available for this date</p></div>
                            ) : (
                                <div className="availability-grid">
                                    {rooms.map(r => (
                                        <div key={r.id}
                                            className={`resource-card ${selectedRoom === r.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedRoom(r.id)}>
                                            <h4>🏢 {r.name}</h4>
                                            <p>Capacity: {r.capacity} · Floor {r.floor}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    <div style={{ marginTop: '24px' }}>
                        <button className="btn btn-primary" onClick={handleReserve} disabled={loading}>
                            {loading ? 'Reserving...' : 'Confirm Reservation'}
                        </button>
                    </div>
                </div>
            )}

            {/* CHANGE REQUESTS */}
            {tab === 'changes' && (
                <div className="card">
                    <div className="card-header">
                        <h3>🔄 My Change Requests</h3>
                    </div>
                    {changeRequests.length === 0 ? (
                        <div className="empty-state">
                            <h3>No change requests</h3>
                            <p>Change requests you submit will appear here</p>
                        </div>
                    ) : (
                        <div className="table-container" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Original Date</th>
                                        <th>Requested Date</th>
                                        <th>Status</th>
                                        <th>Manager Comment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {changeRequests.map(cr => (
                                        <tr key={cr.id}>
                                            <td>{cr.reservationDate}</td>
                                            <td>{cr.newDate || '—'}</td>
                                            <td>
                                                <span className={`badge badge-${cr.status === 'APPROVED' ? 'success' :
                                                        cr.status === 'REJECTED' ? 'danger' : 'warning'
                                                    }`}>
                                                    {cr.status}
                                                </span>
                                            </td>
                                            <td>{cr.managerComment || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* CHANGE REQUEST MODAL */}
            {showChangeModal && (
                <div className="modal-overlay" onClick={() => setShowChangeModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Request Reservation Change</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                            Changes require manager approval. Not allowed on the 28th.
                        </p>
                        <div className="form-group">
                            <label>New Date (optional)</label>
                            <input type="date" value={changeDate} onChange={(e) => setChangeDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>New Chair ID (optional)</label>
                            <input type="number" value={changeChairId} onChange={(e) => setChangeChairId(e.target.value)} placeholder="Leave empty to keep current" />
                        </div>
                        <div className="form-group">
                            <label>New Meeting Room ID (optional)</label>
                            <input type="number" value={changeRoomId} onChange={(e) => setChangeRoomId(e.target.value)} placeholder="Leave empty to keep current" />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowChangeModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleChangeRequest} disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
