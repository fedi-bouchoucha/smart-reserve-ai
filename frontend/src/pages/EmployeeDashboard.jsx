import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Calendar as CalendarIcon, 
  List, 
  PlusCircle, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Info,
  X,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('reservations');
    const [reservations, setReservations] = useState([]);
    const [chairs, setChairs] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [selectedChair, setSelectedChair] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [resourceType, setResourceType] = useState('chair');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    // Weekly Booking Modal
    const [showWeeklyModal, setShowWeeklyModal] = useState(false);
    const [modalWeekData, setModalWeekData] = useState({ weekStr: '', days: [], existing: [] });
    const [modalSelections, setModalSelections] = useState([]);
    const [modalError, setModalError] = useState('');

    // Change Request Modal
    const [showChangeModal, setShowChangeModal] = useState(null);
    const [newChangeDate, setNewChangeDate] = useState('');

    // Calendar color-coding
    const [calendarStatuses, setCalendarStatuses] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showReasonModal, setShowReasonModal] = useState(null);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => { loadReservations(); }, []);

    // Load calendar statuses when month, resource type, or selected resource changes
    useEffect(() => {
        loadCalendarStatuses();
    }, [currentMonth, resourceType, selectedChair, selectedRoom]);

    useEffect(() => {
        if (selectedDates.length > 0) loadAvailability();
        else { setChairs([]); setRooms([]); }
    }, [selectedDates]);

    const loadReservations = async () => {
        try { const res = await api.get('/reservations/my'); setReservations(res.data); }
        catch (e) { console.error(e); }
    };

    const loadCalendarStatuses = async () => {
        try {
            const y = currentMonth.getFullYear();
            const m = currentMonth.getMonth() + 1;
            const resId = resourceType === 'chair' ? selectedChair : selectedRoom;
            let url = `/reservations/calendar-status?year=${y}&month=${m}`;
            if (resId) url += `&resourceType=${resourceType}&resourceId=${resId}`;
            const res = await api.get(url);
            setCalendarStatuses(res.data || []);
        } catch (e) { console.error(e); }
    };

    const loadAvailability = async () => {
        try {
            const results = await Promise.all(selectedDates.map(date =>
                Promise.all([
                    api.get(`/reservations/available/chairs/${date}`),
                    api.get(`/reservations/available/rooms/${date}`)
                ])
            ));
            if (results.length === 0) return;
            let commonChairs = results[0][0].data;
            let commonRooms = results[0][1].data;
            for (let i = 1; i < results.length; i++) {
                const dayChairs = results[i][0].data;
                const dayRooms = results[i][1].data;
                commonChairs = commonChairs.filter(c1 => dayChairs.some(c2 => c2.id === c1.id));
                commonRooms = commonRooms.filter(r1 => dayRooms.some(r2 => r2.id === r1.id));
            }
            setChairs(Array.isArray(commonChairs) ? commonChairs : []);
            setRooms(Array.isArray(commonRooms) ? commonRooms : []);
        } catch (e) { console.error(e); }
    };

    const handleReserve = async () => {
        setLoading(true);
        try {
            await api.post('/reservations/bulk', {
                dates: selectedDates,
                chairId: resourceType === 'chair' ? selectedChair : null,
                meetingRoomId: resourceType === 'room' ? selectedRoom : null,
                startTime, endTime
            });
            setMessage({ type: 'success', text: 'Reservation created successfully!' });
            setSelectedDates([]);
            setTab('reservations');
            loadReservations();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to create reservation' });
        } finally { setLoading(false); }
    };

    const getISOWeekId = (dateObj) => {
        const date = new Date(dateObj.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    };

    const getWeekDays = (dateObj) => {
        const d = new Date(dateObj);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        const daysArr = [];
        for (let i = 0; i < 7; i++) {
            const temp = new Date(monday);
            temp.setDate(monday.getDate() + i);
            daysArr.push(temp.toISOString().split('T')[0]);
        }
        return daysArr;
    };

    const handleCalendarDateClick = (info) => {
        const clickedDate = new Date(info.date);
        const weekId = getISOWeekId(clickedDate);
        const weekDays = getWeekDays(clickedDate);
        const existingInWeek = reservations.filter(r => weekDays.includes(r.date)).map(r => r.date);
        setModalWeekData({ weekStr: weekId, days: weekDays, existing: existingInWeek });
        setModalSelections(existingInWeek);
        setModalError('');
        setShowWeeklyModal(true);
        setSelectedDates([weekDays[0]]);
    };

    const handleModalSubmit = async () => {
        const count = modalSelections.length;
        if (count !== 2 && count !== 3 && count !== 0) {
            setModalError('You must select exactly 2 or 3 days.');
            return;
        }
        setLoading(true);
        try {
            const toDelete = modalWeekData.existing.filter(d => !modalSelections.includes(d));
            const toAdd = modalSelections.filter(d => !modalWeekData.existing.includes(d));
            for (const dateStr of toDelete) {
                const r = reservations.find(r => r.date === dateStr);
                if (r) await api.delete(`/reservations/${r.id}`);
            }
            if (toAdd.length > 0) {
                if (!selectedChair && !selectedRoom) {
                    setModalError('Please select a desk or room first.');
                    setLoading(false);
                    return;
                }
                await api.post('/reservations/bulk', {
                    dates: toAdd,
                    chairId: resourceType === 'chair' ? selectedChair : null,
                    meetingRoomId: resourceType === 'room' ? selectedRoom : null,
                    startTime, endTime
                });
            }
            setMessage({ type: 'success', text: 'Schedule updated!' });
            setShowWeeklyModal(false);
            loadReservations();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to sync' });
        }
        setLoading(false);
    };

    const handleChangeRequest = async () => {
        if (!newChangeDate) return;
        setLoading(true);
        try {
            await api.post('/change-requests', { reservationId: showChangeModal.id, newDate: newChangeDate });
            setMessage({ type: 'success', text: 'Change request sent to your manager!' });
            setShowChangeModal(null);
            setNewChangeDate('');
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to send request' });
        }
        setLoading(false);
    };

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Smart Reserve</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>Office presence and resource management</p>
                </div>
                <div className="tabs">
                    <button className={`tab-btn ${tab === 'reservations' ? 'active' : ''}`} onClick={() => setTab('reservations')}>
                        <List size={16} /> <span>Bookings</span>
                    </button>
                    <button className={`tab-btn ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>
                        <PlusCircle size={16} /> <span>New Reservation</span>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`alert alert-${message.type}`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {tab === 'reservations' && (
                <div className="card-modern" style={{ padding: 0 }}>
                    <table className="table-ui">
                        <thead><tr><th>Date</th><th>Workspace / Room</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
                        <tbody>
                            {reservations.length === 0 ? (
                                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>No active bookings</td></tr>
                            ) : reservations.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 600 }}>{r.date}</td>
                                    <td><div className="badge-ui badge-indigo">{r.chairInfo ? `🪑 ${r.chairInfo}` : `🏢 ${r.meetingRoomName}`}</div></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="btn-ui btn-outline btn-sm" onClick={() => { setShowChangeModal(r); setNewChangeDate(''); }}>Change Date</button>
                                            <button className="btn-ui btn-ghost btn-sm" style={{ color: 'hsl(var(--destructive))' }} onClick={async () => {
                                                if (window.confirm('Cancel this reservation?')) {
                                                    try { await api.delete(`/reservations/${r.id}`); loadReservations(); setMessage({ type: 'success', text: 'Reservation cancelled.' }); }
                                                    catch (e) { setMessage({ type: 'error', text: e.response?.data?.error || 'Cancellation restricted.' }); }
                                                }
                                            }}>Cancel</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'new' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    <div className="card-modern">
                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0.75rem', background: 'hsl(var(--secondary))', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#4caf50' }}/> Selected</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'hsl(var(--primary))' }}/> My Bookings</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#9e9e9e' }}/> Unavailable</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#ff9800' }}/> Capacity 20%</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#f44336' }}/> Resource Booked</div>
                        </div>
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            firstDay={1}
                            hiddenDays={[0, 6]}
                            validRange={{ start: new Date().toISOString().split('T')[0] }}
                            datesSet={(info) => {
                                const mid = new Date((info.start.getTime() + info.end.getTime()) / 2);
                                if (mid.getMonth() !== currentMonth.getMonth() || mid.getFullYear() !== currentMonth.getFullYear()) setCurrentMonth(mid);
                            }}
                            events={[
                                // User's reservations
                                ...(reservations || []).map(r => ({
                                    title: r.chairInfo ? `🪑 ${(r.chairInfo.split(' ')[1] || '')}` : `🏢 ${(r.meetingRoomName?.split(' ')[1] || 'Room')}`,
                                    start: r.date, allDay: true, color: 'hsl(var(--primary))'
                                })),
                                // Background colors from statuses
                                ...calendarStatuses.filter(s => !s.available).map(s => ({
                                    start: s.date, display: 'background',
                                    backgroundColor: s.status === 'BOOKED' ? 'rgba(244,67,54,0.25)' : s.status === 'CAPACITY_REACHED' ? 'rgba(255,152,0,0.3)' : 'rgba(158,158,158,0.25)'
                                }))
                            ]}
                            dateClick={(info) => {
                                const todayStr = new Date().toLocaleDateString('en-CA');
                                const ds = info.dateStr;
                                if (ds < todayStr) return;
                                // Check if unavailable -> show reason
                                const st = calendarStatuses.find(s => s.date === ds);
                                if (st && !st.available) {
                                    setShowReasonModal({ date: new Date(ds).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), reason: st.reason, status: st.status });
                                    return;
                                }
                                if (selectedDates.includes(ds)) setSelectedDates(prev => prev.filter(d => d !== ds));
                                else setSelectedDates(prev => [...prev, ds]);
                            }}
                            dayCellClassNames={(arg) => {
                                const dateStr = arg.date.toLocaleDateString('en-CA');
                                return selectedDates.includes(dateStr) ? 'selected-day' : '';
                            }}
                            dayCellContent={(arg) => {
                                const ds = arg.date.toLocaleDateString('en-CA');
                                const st = calendarStatuses.find(s => s.date === ds);
                                const pct = st ? Math.round(st.occupancyPercentage * 100) : 0;
                                
                                // Professional indicator colors
                                let barColor = '#4caf50'; // Green (Low capacity)
                                if (pct >= 15) barColor = '#ff9800'; // Orange (Nearing limit)
                                if (pct >= 20 || (st && !st.available)) barColor = '#f44336'; // Red (Full/Blocked)

                                return (
                                    <div style={{ position: 'relative', width: '100%', height: '100%', padding: '2px', display: 'flex', flexDirection: 'column', minHeight: '40px' }}>
                                        <div style={{ fontWeight: 500, paddingLeft: '4px' }}>{arg.dayNumberText}</div>
                                        {st && (
                                            <div style={{ marginTop: 'auto', width: '100%', padding: '0 4px', paddingBottom: '4px' }} title={`Estimated office capacity: ${pct}%`}>
                                                <div style={{ height: '4px', width: '100%', backgroundColor: 'hsl(var(--muted))', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${Math.min(pct * 5, 100)}%`, backgroundColor: barColor, transition: 'width 0.3s ease' }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }}
                        />
                        <style>{`.selected-day { background: #4caf50 !important; color: white !important; font-weight: 700; border-radius: 4px; }`}</style>
                    </div>

                    <div className="card-modern" style={{ position: 'sticky', top: '2rem' }}>
                        <h4 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Reservation Details</h4>

                        <div className="form-group">
                            <label className="form-label">Type of Workspace</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button className={`btn-ui ${resourceType === 'chair' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setResourceType('chair'); setSelectedRoom(null); }}>
                                    <Layers size={16} /> Desk
                                </button>
                                <button className={`btn-ui ${resourceType === 'room' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setResourceType('room'); setSelectedChair(null); }}>
                                    <MapPin size={16} /> Room
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{resourceType === 'chair' ? 'Select Desk' : 'Select Meeting Room'}</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '2px' }}>
                                {(resourceType === 'chair' ? (chairs || []) : (rooms || [])).length === 0 ? (
                                    <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', padding: '1rem', textAlign: 'center' }}>Select dates first to see available resources</div>
                                ) : (resourceType === 'chair' ? chairs : rooms).map(r => (
                                    <div key={r.id}
                                        className={`resource-card ${(resourceType === 'chair' ? selectedChair : selectedRoom) === r.id ? 'selected' : ''}`}
                                        onClick={() => resourceType === 'chair' ? setSelectedChair(r.id) : setSelectedRoom(r.id)}
                                    >
                                        <div style={{ fontWeight: 600 }}>{resourceType === 'chair' ? `Desk ${r.number}` : r.name}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Floor {r.floor} • {resourceType === 'chair' ? (r.emplacementName || '') : `Capacity: ${r.capacity}`}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">From</label>
                                <input type="time" className="input-modern" value={startTime} onChange={e => setStartTime(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">To</label>
                                <input type="time" className="input-modern" value={endTime} onChange={e => setEndTime(e.target.value)} />
                            </div>
                        </div>

                        <button className="btn-ui btn-primary" style={{ width: '100%', marginTop: '2rem' }}
                            onClick={handleReserve}
                            disabled={selectedDates.length === 0 || (!selectedChair && !selectedRoom)}
                        >
                            Complete Booking ({selectedDates.length})
                        </button>
                        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
                            Click calendar days to select multiple dates.
                        </p>
                    </div>
                </div>
            )}

            {/* Weekly Modal */}
            <AnimatePresence>
                {showWeeklyModal && (
                    <div className="modal-overlay modal-modern-overlay" onClick={() => setShowWeeklyModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }} className="modal-content modal-modern-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Weekly Schedule: {modalWeekData.weekStr}</h2>
                            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>Select 2-3 days and choose your workspace type.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className={`resource-card ${resourceType === 'chair' ? 'selected' : ''}`} onClick={() => setResourceType('chair')}>
                                    <div style={{ fontWeight: 700 }}>Desk</div><div style={{ fontSize: '0.7rem' }}>Standard workstation</div>
                                </div>
                                <div className={`resource-card ${resourceType === 'room' ? 'selected' : ''}`} onClick={() => setResourceType('room')}>
                                    <div style={{ fontWeight: 700 }}>Meeting Room</div><div style={{ fontSize: '0.7rem' }}>Collaborative space</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                                {modalWeekData.days.map((d, i) => {
                                    const date = new Date(d);
                                    if (date.getDay() === 0 || date.getDay() === 6) return null;
                                    const isSelected = modalSelections.includes(d);
                                    return (
                                        <div key={i} className={`resource-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => isSelected ? setModalSelections(prev => prev.filter(x => x !== d)) : setModalSelections(prev => [...prev, d])}
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <span>{new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                            {isSelected && <CheckCircle2 size={16} />}
                                        </div>
                                    );
                                })}
                            </div>

                            {modalError && <div className="alert alert-error">{modalError}</div>}
                            <div className="modal-actions">
                                <button className="btn-ui btn-ghost" onClick={() => setShowWeeklyModal(false)}>Cancel</button>
                                <button className="btn-ui btn-primary" onClick={handleModalSubmit} disabled={loading}>
                                    {loading ? 'Processing...' : 'Apply Schedule'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Change Request Modal */}
            <AnimatePresence>
                {showChangeModal && (
                    <div className="modal-overlay modal-modern-overlay" onClick={() => setShowChangeModal(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }} className="modal-content modal-modern-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Request Date Change</h2>
                            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
                                For reservation on <strong>{showChangeModal.date}</strong> ({showChangeModal.chairInfo || showChangeModal.meetingRoomName}).
                            </p>
                            <div className="form-group">
                                <label className="form-label">New Target Date</label>
                                <input type="date" className="input-modern" value={newChangeDate} onChange={e => setNewChangeDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '1rem' }}>Your manager will review this request.</p>
                            <div className="modal-actions" style={{ marginTop: '2rem' }}>
                                <button className="btn-ui btn-ghost" onClick={() => setShowChangeModal(null)}>Cancel</button>
                                <button className="btn-ui btn-primary" onClick={handleChangeRequest} disabled={loading || !newChangeDate}>
                                    {loading ? 'Sending...' : 'Submit Request'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reason Modal */}
            <AnimatePresence>
                {showReasonModal && (
                    <div className="modal-overlay modal-modern-overlay" onClick={() => setShowReasonModal(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }} className="modal-content modal-modern-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <AlertTriangle size={24} style={{ color: showReasonModal.status === 'BOOKED' ? '#f44336' : showReasonModal.status === 'CAPACITY_REACHED' ? '#ff9800' : '#9e9e9e' }} />
                                    <div>
                                        <h3 style={{ fontWeight: 800 }}>Unavailable</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>{showReasonModal.date}</p>
                                    </div>
                                </div>
                                <button className="btn-ui btn-ghost" style={{ padding: '0.25rem' }} onClick={() => setShowReasonModal(null)}><X size={18} /></button>
                            </div>
                            <div style={{ background: 'hsl(var(--secondary))', padding: '1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem', fontWeight: 700 }}>Reason</div>
                                <div style={{ fontWeight: 500, lineHeight: 1.5 }}>"{showReasonModal.reason}"</div>
                            </div>
                            <button className="btn-ui btn-primary" style={{ width: '100%' }} onClick={() => setShowReasonModal(null)}>OK</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
