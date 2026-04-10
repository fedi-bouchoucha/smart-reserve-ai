import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  List, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  X,
  AlertTriangle,
  Coffee,
  Building2,
  CalendarDays,
  Clock,
  Users,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('reservations');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // === BOOKINGS DATA ===
    const [deskReservations, setDeskReservations] = useState([]);
    const [meetingRoomBookings, setMeetingRoomBookings] = useState([]);
    const [daysOff, setDaysOff] = useState([]);

    // === UNIFIED CALENDAR STATE ===
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthSummary, setMonthSummary] = useState(null);
    const [existingDaysOff, setExistingDaysOff] = useState([]);
    const [selectedDaysOff, setSelectedDaysOff] = useState([]);
    const [calendarStatuses, setCalendarStatuses] = useState([]);

    // === DESK: Per-day assignment (date → desk) ===
    // Each entry: { date: '2026-04-15', chairId: 3, chairNumber: 5, floor: 2, emplacementName: 'Zone A' }
    const [deskAssignments, setDeskAssignments] = useState([]);

    // Desk picker modal (appears when user clicks a date in desk mode)
    const [showDeskPicker, setShowDeskPicker] = useState(null); // null or { date: string }
    const [pickerChairs, setPickerChairs] = useState([]);
    const [pickerLoading, setPickerLoading] = useState(false);

    // Mode toggle
    const [calendarMode, setCalendarMode] = useState('desk');

    // Reason modal
    const [showReasonModal, setShowReasonModal] = useState(null);

    // === CHANGE REQUEST MODAL ===
    const [showChangeModal, setShowChangeModal] = useState(null);
    const [newChangeDate, setNewChangeDate] = useState('');
    const [newChangeResourceType, setNewChangeResourceType] = useState('chair');
    const [newChangeChairId, setNewChangeChairId] = useState(null);
    const [newChangeRoomId, setNewChangeRoomId] = useState(null);
    const [modalAvailableChairs, setModalAvailableChairs] = useState([]);
    const [modalAvailableRooms, setModalAvailableRooms] = useState([]);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => { loadAllData(); }, []);

    useEffect(() => {
        loadCalendarStatuses();
        loadMonthDaysOff();
        loadMonthSummary();
    }, [currentMonth]);

    useEffect(() => {
        if (showChangeModal && newChangeDate) loadModalAvailability();
    }, [newChangeDate, newChangeResourceType, showChangeModal]);

    // Load available desks when desk picker date changes
    useEffect(() => {
        if (showDeskPicker) {
            loadPickerChairs(showDeskPicker.date);
        }
    }, [showDeskPicker]);

    // ==================== DATA LOADING ====================

    const loadAllData = async () => {
        try {
            const [deskRes, roomRes, daysOffRes] = await Promise.all([
                api.get('/reservations/my/desks'),
                api.get('/reservations/my/meeting-rooms'),
                api.get('/days-off/my')
            ]);
            setDeskReservations(deskRes.data || []);
            setMeetingRoomBookings(roomRes.data || []);
            setDaysOff(daysOffRes.data || []);
        } catch (e) { console.error(e); }
    };

    const loadMonthDaysOff = async () => {
        try {
            const y = currentMonth.getFullYear();
            const m = currentMonth.getMonth() + 1;
            const res = await api.get(`/days-off/my/month?year=${y}&month=${m}`);
            setExistingDaysOff((res.data || []).map(d => d.date));
        } catch (e) { console.error(e); }
    };

    const loadMonthSummary = async () => {
        try {
            const y = currentMonth.getFullYear();
            const m = currentMonth.getMonth() + 1;
            const res = await api.get(`/days-off/my/month-summary?year=${y}&month=${m}`);
            setMonthSummary(res.data);
        } catch (e) { console.error(e); }
    };

    const loadCalendarStatuses = async () => {
        try {
            const y = currentMonth.getFullYear();
            const m = currentMonth.getMonth() + 1;
            const url = `/reservations/calendar-status?year=${y}&month=${m}`;
            const res = await api.get(url);
            setCalendarStatuses(res.data || []);
        } catch (e) { console.error(e); }
    };

    const loadPickerChairs = async (date) => {
        setPickerLoading(true);
        try {
            const res = await api.get(`/reservations/available/chairs/${date}`);
            setPickerChairs(res.data || []);
        } catch (e) { console.error(e); setPickerChairs([]); }
        setPickerLoading(false);
    };

    const loadModalAvailability = async () => {
        try {
            const [chairRes, roomRes] = await Promise.all([
                api.get(`/reservations/available/chairs/${newChangeDate}`),
                api.get(`/reservations/available/rooms/${newChangeDate}`)
            ]);
            setModalAvailableChairs(chairRes.data || []);
            setModalAvailableRooms(roomRes.data || []);
        } catch (e) { console.error(e); }
    };

    // ==================== ACTIONS ====================

    const handlePickDesk = (chair) => {
        const date = showDeskPicker.date;
        // Remove existing assignment for this date if any, then add new one
        setDeskAssignments(prev => [
            ...prev.filter(a => a.date !== date),
            { date, chairId: chair.id, chairNumber: chair.number, floor: chair.floor, emplacementName: chair.emplacementName || '' }
        ]);
        setShowDeskPicker(null);
    };

    const handleRemoveAssignment = (date) => {
        setDeskAssignments(prev => prev.filter(a => a.date !== date));
    };

    const handleDeskReserveAll = async () => {
        if (deskAssignments.length === 0) return;
        setLoading(true);
        let successCount = 0;
        let errorMsg = '';
        try {
            for (const assignment of deskAssignments) {
                try {
                    await api.post('/reservations', {
                        chairId: assignment.chairId,
                        meetingRoomId: null,
                        date: assignment.date,
                        startTime: '09:00',
                        endTime: '17:00'
                    });
                    successCount++;
                } catch (e) {
                    const msg = e.response?.data?.error || `Failed for ${assignment.date}`;
                    errorMsg += (errorMsg ? '; ' : '') + msg;
                }
            }
            if (successCount > 0) {
                setMessage({ type: 'success', text: `${successCount} desk reservation${successCount !== 1 ? 's' : ''} created!${errorMsg ? ' Some failed: ' + errorMsg : ''}` });
            } else {
                setMessage({ type: 'error', text: errorMsg || 'Failed to create reservations' });
            }
            setDeskAssignments([]);
            loadAllData();
            loadCalendarStatuses();
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to create reservations' });
        } finally { setLoading(false); }
    };

    const handleAddDaysOff = async () => {
        if (selectedDaysOff.length === 0) return;
        setLoading(true);
        try {
            await api.post('/days-off', { dates: selectedDaysOff });
            setMessage({ type: 'success', text: 'Days off saved successfully!' });
            setSelectedDaysOff([]);
            loadMonthDaysOff();
            loadMonthSummary();
            loadAllData();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to save days off' });
        } finally { setLoading(false); }
    };

    const handleRemoveDayOff = async (date) => {
        setLoading(true);
        try {
            await api.delete(`/days-off/${date}`);
            setMessage({ type: 'success', text: 'Day off removed.' });
            loadMonthDaysOff();
            loadMonthSummary();
            loadAllData();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to remove day off' });
        } finally { setLoading(false); }
    };

    const handleDeleteReservation = async (id) => {
        if (!window.confirm('Cancel this reservation?')) return;
        try {
            await api.delete(`/reservations/${id}`);
            loadAllData();
            setMessage({ type: 'success', text: 'Reservation cancelled.' });
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Cancellation failed.' });
        }
    };

    const handleChangeRequest = async () => {
        if (!newChangeDate) return;
        setLoading(true);
        try {
            await api.post('/change-requests', { 
                reservationId: showChangeModal.id, 
                newDate: newChangeDate,
                newChairId: newChangeResourceType === 'chair' ? newChangeChairId : null,
                newMeetingRoomId: newChangeResourceType === 'room' ? newChangeRoomId : null
            });
            setMessage({ type: 'success', text: 'Change request sent to your manager!' });
            setShowChangeModal(null);
            setNewChangeDate('');
            setNewChangeChairId(null);
            setNewChangeRoomId(null);
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to send request' });
        }
        setLoading(false);
    };

    // ==================== CALENDAR CLICK HANDLER ====================
    const handleCalendarDateClick = (info) => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const ds = info.dateStr;
        if (ds < todayStr) return;
        const dateObj = new Date(ds);
        if (dateObj.getDay() === 0 || dateObj.getDay() === 6) return;

        if (calendarMode === 'dayoff') {
            if (existingDaysOff.includes(ds)) {
                handleRemoveDayOff(ds);
                return;
            }
            if (selectedDaysOff.includes(ds)) {
                setSelectedDaysOff(prev => prev.filter(d => d !== ds));
            } else {
                setSelectedDaysOff(prev => [...prev, ds]);
            }
        } else {
            // DESK MODE — check availability first
            const st = calendarStatuses.find(s => s.date === ds);
            if (st && !st.available) {
                setShowReasonModal({ date: new Date(ds).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), reason: st.reason, status: st.status });
                return;
            }
            // If already assigned, clicking again removes it
            if (deskAssignments.some(a => a.date === ds)) {
                handleRemoveAssignment(ds);
            } else {
                // Open the desk picker modal for this date
                setShowDeskPicker({ date: ds, dateFormatted: new Date(ds).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) });
            }
        }
    };

    // ==================== BUILD CALENDAR EVENTS ====================
    const buildCalendarEvents = () => {
        const events = [];

        // Existing desk reservations
        deskReservations.forEach(r => {
            events.push({
                title: `🪑 ${(r.chairInfo?.split(' ')[1] || 'Desk')}`,
                start: r.date, allDay: true, color: 'hsl(var(--primary))'
            });
        });

        // Pending desk assignments (not yet saved)
        deskAssignments.forEach(a => {
            events.push({
                title: `🪑 Desk ${a.chairNumber}`,
                start: a.date, allDay: true, color: '#4caf50'
            });
        });

        // Existing days off
        existingDaysOff.forEach(d => {
            events.push({
                title: '🏖️ Day Off',
                start: d, allDay: true, color: '#ff9800'
            });
        });

        // Selected days off (unsaved)
        selectedDaysOff.forEach(d => {
            events.push({
                title: '🏖️ Selected',
                start: d, allDay: true, color: '#e91e63'
            });
        });

        // Background colors from desk statuses
        if (calendarMode === 'desk') {
            calendarStatuses.filter(s => !s.available).forEach(s => {
                events.push({
                    start: s.date, display: 'background',
                    backgroundColor: s.status === 'BOOKED' ? 'rgba(244,67,54,0.25)' : s.status === 'CAPACITY_REACHED' ? 'rgba(255,152,0,0.3)' : 'rgba(158,158,158,0.25)'
                });
            });
        }

        return events;
    };

    // ==================== RENDER ====================
    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Smart Reserve</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>Desk reservations & days off management</p>
                </div>
                <div className="tabs">
                    <button className={`tab-btn ${tab === 'reservations' ? 'active' : ''}`} onClick={() => setTab('reservations')} data-testid="tab-reservations">
                        <List size={16} /> <span>Bookings</span>
                    </button>
                    <button className={`tab-btn ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')} data-testid="tab-calendar">
                        <CalendarDays size={16} /> <span>Reserve / Days Off</span>
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

            {/* ==================== BOOKINGS TAB ==================== */}
            {tab === 'reservations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Desk Reservations */}
                    <div className="card-modern" style={{ padding: 0 }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Layers size={18} style={{ color: 'hsl(var(--primary))' }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Desk Reservations</h3>
                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{deskReservations.length} active booking{deskReservations.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <table className="table-ui">
                            <thead><tr><th>Date</th><th>Workspace</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
                            <tbody>
                                {deskReservations.length === 0 ? (
                                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2.5rem', color: 'hsl(var(--muted-foreground))' }}>No desk bookings yet</td></tr>
                                ) : deskReservations.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 600 }}>{r.date}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div className="badge-ui badge-indigo">🪑 {r.chairInfo}</div>
                                                {r.status === 'PENDING_APPROVAL' && (
                                                    <div className="badge-ui" style={{ background: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}>Pending Manager</div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button className="btn-ui btn-outline btn-sm" disabled={r.status === 'PENDING_APPROVAL'} onClick={() => { setShowChangeModal(r); setNewChangeDate(''); }}>Change</button>
                                                <button className="btn-ui btn-ghost btn-sm" style={{ color: 'hsl(var(--destructive))' }} onClick={() => handleDeleteReservation(r.id)}>Cancel</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Meeting Room Bookings */}
                    <div className="card-modern" style={{ padding: 0 }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: 'hsl(142.1 76.2% 36.3% / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building2 size={18} style={{ color: 'hsl(142.1, 76.2%, 36.3%)' }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Meeting Room Bookings</h3>
                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{meetingRoomBookings.length} active booking{meetingRoomBookings.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <table className="table-ui">
                            <thead><tr><th>Date</th><th>Room</th><th>Time</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
                            <tbody>
                                {meetingRoomBookings.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'hsl(var(--muted-foreground))' }}>No meeting room bookings yet</td></tr>
                                ) : meetingRoomBookings.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 600 }}>{r.date}</td>
                                        <td><div className="badge-ui badge-success">🏢 {r.meetingRoomName}</div></td>
                                        <td style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>{r.startTime?.substring(0,5)} — {r.endTime?.substring(0,5)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-ui btn-ghost btn-sm" style={{ color: 'hsl(var(--destructive))' }} onClick={() => handleDeleteReservation(r.id)}>Cancel</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Days Off */}
                    <div className="card-modern" style={{ padding: 0 }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: 'hsl(38 92% 50% / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Coffee size={18} style={{ color: 'hsl(38, 92%, 50%)' }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Days Off</h3>
                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{daysOff.length} day{daysOff.length !== 1 ? 's' : ''} off</p>
                            </div>
                        </div>
                        <table className="table-ui">
                            <thead><tr><th>Date</th><th>Status</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
                            <tbody>
                                {daysOff.length === 0 ? (
                                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2.5rem', color: 'hsl(var(--muted-foreground))' }}>No days off scheduled</td></tr>
                                ) : daysOff.map(d => (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: 600 }}>{d.date}</td>
                                        <td><div className="badge-ui badge-warning">Day Off</div></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-ui btn-ghost btn-sm" style={{ color: 'hsl(var(--destructive))' }} onClick={() => handleRemoveDayOff(d.date)}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ==================== UNIFIED CALENDAR TAB ==================== */}
            {tab === 'calendar' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
                    {/* Calendar */}
                    <div className="card-modern">
                        {/* Mode Toggle */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button
                                className={`btn-ui ${calendarMode === 'desk' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => { setCalendarMode('desk'); setSelectedDaysOff([]); }}
                                style={{ flex: 1 }}
                            >
                                <Layers size={16} /> Reserve Desk
                            </button>
                            <button
                                className={`btn-ui ${calendarMode === 'dayoff' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => { setCalendarMode('dayoff'); setDeskAssignments([]); }}
                                style={{ flex: 1 }}
                            >
                                <Coffee size={16} /> Mark Days Off
                            </button>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', padding: '0.75rem', background: 'hsl(var(--secondary))', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 600, flexWrap: 'wrap' }}>
                            {calendarMode === 'desk' && <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#4caf50' }}/>Selected Desk</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'hsl(var(--primary))' }}/>Booked Desk</div>
                            </>}
                            {calendarMode === 'dayoff' && <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#e91e63' }}/>Selected</div>
                            </>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#ff9800' }}/>Day Off</div>
                        </div>

                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            firstDay={1}
                            hiddenDays={calendarMode === 'desk' ? [0, 6] : []}
                            validRange={{ start: new Date().toISOString().split('T')[0] }}
                            datesSet={(info) => {
                                const mid = new Date((info.start.getTime() + info.end.getTime()) / 2);
                                if (mid.getMonth() !== currentMonth.getMonth() || mid.getFullYear() !== currentMonth.getFullYear()) setCurrentMonth(mid);
                            }}
                            events={buildCalendarEvents()}
                            dateClick={handleCalendarDateClick}
                            dayCellClassNames={(arg) => {
                                const dateStr = arg.date.toLocaleDateString('en-CA');
                                if (calendarMode === 'desk' && deskAssignments.some(a => a.date === dateStr)) return 'assigned-day';
                                if (calendarMode === 'dayoff' && selectedDaysOff.includes(dateStr)) return 'dayoff-selected';
                                if (existingDaysOff.includes(dateStr)) return 'dayoff-existing';
                                return '';
                            }}
                            dayCellContent={(arg) => {
                                return (
                                    <div style={{ position: 'relative', width: '100%', height: '100%', padding: '2px', display: 'flex', flexDirection: 'column', minHeight: '40px' }}>
                                        <div style={{ fontWeight: 500, paddingLeft: '4px' }}>{arg.dayNumberText}</div>
                                    </div>
                                );
                            }}
                        />
                        <style>{`
                            .assigned-day { background: rgba(76,175,80,0.15) !important; outline: 2px solid #4caf50; outline-offset: -2px; border-radius: 4px; }
                            .dayoff-existing { background: rgba(255,152,0,0.12) !important; }
                            .dayoff-selected { background: rgba(233,30,99,0.15) !important; outline: 2px solid #e91e63; outline-offset: -2px; border-radius: 4px; }
                        `}</style>
                    </div>

                    {/* Sidebar Panel */}
                    <div className="card-modern" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        
                        {/* ===== DESK MODE PANEL ===== */}
                        {calendarMode === 'desk' && (
                            <>
                                <h4 style={{ marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Layers size={18} /> Desk Assignments
                                </h4>

                                {deskAssignments.length === 0 ? (
                                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                                        <Layers size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                                        <p>Click a date on the calendar to pick a desk for that day.</p>
                                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Each day can have a different desk.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                            {deskAssignments.length} day{deskAssignments.length !== 1 ? 's' : ''} assigned
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                                            {deskAssignments.sort((a, b) => a.date.localeCompare(b.date)).map(a => (
                                                <div key={a.date} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '0.65rem 0.75rem', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)',
                                                    background: 'hsl(var(--card))', transition: 'all 0.2s ease'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                            {new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                                                            🪑 Desk {a.chairNumber} • Floor {a.floor}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                        <button className="btn-ui btn-ghost btn-sm" style={{ padding: '0.2rem 0.4rem', height: 'auto' }}
                                                            title="Change desk"
                                                            onClick={() => setShowDeskPicker({ date: a.date, dateFormatted: new Date(a.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) })}
                                                        >
                                                            <Layers size={14} />
                                                        </button>
                                                        <button className="btn-ui btn-ghost btn-sm" style={{ padding: '0.2rem 0.4rem', height: 'auto', color: 'hsl(var(--destructive))' }}
                                                            title="Remove"
                                                            onClick={() => handleRemoveAssignment(a.date)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <button className="btn-ui btn-primary" style={{ width: '100%' }}
                                    onClick={handleDeskReserveAll}
                                    disabled={deskAssignments.length === 0 || loading}
                                    data-testid="complete-desk-booking-btn"
                                >
                                    {loading ? 'Booking...' : `Book All (${deskAssignments.length} day${deskAssignments.length !== 1 ? 's' : ''})`}
                                </button>
                            </>
                        )}

                        {/* ===== DAYS OFF MODE PANEL ===== */}
                        {calendarMode === 'dayoff' && (
                            <>
                                <h4 style={{ marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Coffee size={18} /> Days Off Manager
                                </h4>

                                {monthSummary && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'hsl(var(--secondary))', borderRadius: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Monthly Presence</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: monthSummary.presencePercentage >= 50 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                                                {Math.round(monthSummary.presencePercentage)}%
                                            </span>
                                        </div>
                                        <div style={{ height: '8px', width: '100%', backgroundColor: 'hsl(var(--muted))', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min(monthSummary.presencePercentage, 100)}%`,
                                                backgroundColor: monthSummary.presencePercentage >= 50 ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span>Working days</span><span style={{ fontWeight: 600 }}>{monthSummary.workingDays}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span>Days off used</span><span style={{ fontWeight: 600 }}>{monthSummary.daysOff}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Max days off</span><span style={{ fontWeight: 600 }}>{monthSummary.maxDaysOff}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedDaysOff.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--muted-foreground))' }}>
                                            Selected ({selectedDaysOff.length} day{selectedDaysOff.length !== 1 ? 's' : ''})
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                            {selectedDaysOff.sort().map(d => (
                                                <div key={d} className="badge-ui badge-warning" style={{ cursor: 'pointer' }} onClick={() => setSelectedDaysOff(prev => prev.filter(x => x !== d))}>
                                                    {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ✕
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button className="btn-ui btn-primary" style={{ width: '100%' }}
                                    onClick={handleAddDaysOff}
                                    disabled={selectedDaysOff.length === 0 || loading}
                                >
                                    {loading ? 'Saving...' : `Save Days Off (${selectedDaysOff.length})`}
                                </button>
                                <p style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center', lineHeight: 1.5 }}>
                                    Click days to mark as day off. You must be present at least 50% of working days.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ==================== DESK PICKER MODAL ==================== */}
            <AnimatePresence>
                {showDeskPicker && (
                    <div className="modal-overlay modal-modern-overlay" onClick={() => setShowDeskPicker(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }} className="modal-content modal-modern-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Choose a Desk</h2>
                                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                        {showDeskPicker.dateFormatted}
                                    </p>
                                </div>
                                <button className="btn-ui btn-ghost" style={{ padding: '0.25rem' }} onClick={() => setShowDeskPicker(null)}><X size={18} /></button>
                            </div>

                            {pickerLoading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Loading available desks...</div>
                            ) : pickerChairs.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                    <AlertCircle size={32} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                                    <p>No desks available for this date.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                                    {pickerChairs.map(chair => {
                                        const isCurrentlyAssigned = deskAssignments.some(a => a.date === showDeskPicker.date && a.chairId === chair.id);
                                        return (
                                            <div key={chair.id}
                                                className={`resource-card ${isCurrentlyAssigned ? 'selected' : ''}`}
                                                onClick={() => handlePickDesk(chair)}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>Desk {chair.number}</div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Floor {chair.floor} • {chair.emplacementName || ''}</div>
                                                </div>
                                                {isCurrentlyAssigned && <CheckCircle2 size={18} style={{ color: 'hsl(var(--primary))' }} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ==================== CHANGE REQUEST MODAL ==================== */}
            <AnimatePresence>
                {showChangeModal && (
                    <div className="modal-overlay modal-modern-overlay" onClick={() => setShowChangeModal(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }} className="modal-content modal-modern-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Request Change</h2>
                            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
                                For booking on <strong>{showChangeModal.date}</strong> ({showChangeModal.chairInfo || showChangeModal.meetingRoomName}).
                            </p>
                            
                            <div className="form-group">
                                <label className="form-label">New Date</label>
                                <input type="date" className="input-modern" value={newChangeDate} onChange={e => setNewChangeDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                            </div>

                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label className="form-label">Resource Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <button className={`btn-ui btn-sm ${newChangeResourceType === 'chair' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setNewChangeResourceType('chair'); setNewChangeRoomId(null); }}>Desk</button>
                                    <button className={`btn-ui btn-sm ${newChangeResourceType === 'room' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setNewChangeResourceType('room'); setNewChangeChairId(null); }}>Room</button>
                                </div>

                                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', padding: '0.5rem' }}>
                                    {!newChangeDate ? (
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center', padding: '1rem' }}>Select a date first</div>
                                    ) : (newChangeResourceType === 'chair' ? modalAvailableChairs : modalAvailableRooms).length === 0 ? (
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center', padding: '1rem' }}>No resources available</div>
                                    ) : (newChangeResourceType === 'chair' ? modalAvailableChairs : modalAvailableRooms).map(r => (
                                        <div key={r.id}
                                            className={`resource-card ${(newChangeResourceType === 'chair' ? newChangeChairId : newChangeRoomId) === r.id ? 'selected' : ''}`}
                                            onClick={() => newChangeResourceType === 'chair' ? setNewChangeChairId(r.id) : setNewChangeRoomId(r.id)}
                                            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                                        >
                                            <div style={{ fontWeight: 600 }}>{newChangeResourceType === 'chair' ? `Desk ${r.number}` : r.name}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Floor {r.floor}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '1rem' }}>Your manager will review this request.</p>
                            
                            <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button className="btn-ui btn-ghost" onClick={() => setShowChangeModal(null)}>Cancel</button>
                                <button className="btn-ui btn-primary" onClick={handleChangeRequest} disabled={loading || !newChangeDate || (!newChangeChairId && !newChangeRoomId)}>
                                    {loading ? 'Sending...' : 'Submit Request'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ==================== REASON MODAL ==================== */}
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
