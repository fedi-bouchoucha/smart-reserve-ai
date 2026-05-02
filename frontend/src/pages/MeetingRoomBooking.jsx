import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MeetingRoomBooking() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Room data
    const [allRooms, setAllRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [meetingRoomBookings, setMeetingRoomBookings] = useState([]);

    // Calendar state
    const [selectedDate, setSelectedDate] = useState(null);
    const [meetingStartTime, setMeetingStartTime] = useState('09:00');
    const [meetingEndTime, setMeetingEndTime] = useState('10:00');
    const [roomAvailable, setRoomAvailable] = useState(null);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => { 
        loadAllRooms(); 
        loadMyBookings(); 
    }, []);

    // Check room availability when details change
    useEffect(() => {
        if (selectedRoom && selectedDate && meetingStartTime && meetingEndTime) {
            checkRoomAvailability();
        } else {
            setRoomAvailable(null);
        }
    }, [selectedRoom, selectedDate, meetingStartTime, meetingEndTime]);

    const loadAllRooms = async () => {
        try {
            const res = await api.get('/reservations/rooms/all');
            setAllRooms(res.data || []);
        } catch (e) { console.error(e); }
    };

    const loadMyBookings = async () => {
        try {
            const res = await api.get('/reservations/my/meeting-rooms');
            setMeetingRoomBookings(res.data || []);
        } catch (e) { console.error(e); }
    };

    const checkRoomAvailability = async () => {
        try {
            const res = await api.get(`/reservations/rooms/check-availability?roomId=${selectedRoom}&date=${selectedDate}&startTime=${meetingStartTime}&endTime=${meetingEndTime}`);
            setRoomAvailable(res.data.available);
        } catch (e) { setRoomAvailable(null); }
    };

    const handleBookRoom = async () => {
        if (!selectedRoom || !selectedDate) return;
        setLoading(true);
        try {
            await api.post('/reservations/meeting-room', {
                meetingRoomId: selectedRoom,
                date: selectedDate,
                startTime: meetingStartTime,
                endTime: meetingEndTime
            });
            setMessage({ type: 'success', text: 'Meeting room booked successfully!' });
            setSelectedDate(null);
            setRoomAvailable(null);
            loadMyBookings();
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to book meeting room' });
        } finally { setLoading(false); }
    };

    const handleCancelBooking = async (id) => {
        if (!window.confirm('Cancel this meeting room booking?')) return;
        try {
            await api.delete(`/reservations/${id}`);
            loadMyBookings();
            setMessage({ type: 'success', text: 'Booking cancelled.' });
        } catch (e) {
            setMessage({ type: 'error', text: e.response?.data?.error || 'Cancellation failed.' });
        }
    };

    // Build calendar events from existing bookings
    const calendarEvents = meetingRoomBookings.map(b => ({
        title: `🏢 ${b.meetingRoomName || 'Room'}`,
        start: b.date,
        allDay: true,
        color: 'hsl(142.1, 76.2%, 36.3%)',
        extendedProps: { booking: b }
    }));

    // Find the selected room object
    const selectedRoomObj = allRooms.find(r => r.id === selectedRoom);

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'linear-gradient(135deg, hsl(142.1, 76.2%, 36.3%), hsl(160, 70%, 40%))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Building2 size={24} />
                    </div>
                    Meeting Room Booking
                </h1>
                <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>Reserve any meeting room freely — no restrictions</p>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`alert alert-${message.type}`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
                {/* Calendar */}
                <div className="card-modern">
                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0.75rem', background: 'hsl(var(--secondary))', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#7c3aed' }}/>Selected</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'hsl(142.1, 76.2%, 36.3%)' }}/>My Bookings</div>
                    </div>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        hiddenDays={[0, 6]}
                        validRange={{ start: new Date().toISOString().split('T')[0] }}
                        events={calendarEvents}
                        dateClick={(info) => {
                            const todayStr = new Date().toLocaleDateString('en-CA');
                            if (info.dateStr < todayStr) return;
                            const d = new Date(info.dateStr);
                            if (d.getDay() === 0 || d.getDay() === 6) return; // Saturday/Sunday
                            setSelectedDate(info.dateStr);
                        }}
                        dayCellClassNames={(arg) => {
                            const dateStr = arg.date.toLocaleDateString('en-CA');
                            return dateStr === selectedDate ? 'meeting-selected-day' : '';
                        }}
                    />
                    <style>{`
                        .meeting-selected-day { background: hsl(262.1, 83.3%, 57.8%, 0.15) !important; outline: 2px solid hsl(262.1, 83.3%, 57.8%); outline-offset: -2px; border-radius: 4px; }
                    `}</style>
                </div>

                {/* Booking Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Room Selector */}
                    <div className="card-modern" style={{ position: 'sticky', top: '2rem' }}>
                        <h4 style={{ marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building2 size={18} /> Booking Details
                        </h4>

                        {selectedDate && (
                            <div style={{ padding: '0.75rem', background: 'hsl(var(--primary) / 0.05)', borderRadius: '0.5rem', marginBottom: '1.25rem', border: '1px solid hsl(var(--primary) / 0.15)' }}>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Selected Date</div>
                                <div style={{ fontWeight: 700 }}>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Meeting Room</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {allRooms.map(r => (
                                    <div key={r.id}
                                        className={`resource-card ${selectedRoom === r.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedRoom(r.id)}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{r.name}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Floor {r.floor}</div>
                                        </div>
                                        <div className="badge-ui badge-indigo" style={{ fontSize: '0.7rem' }}>
                                            <Users size={12} /> {r.capacity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Start Time</label>
                                <input type="time" className="input-modern" value={meetingStartTime} onChange={e => setMeetingStartTime(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Time</label>
                                <input type="time" className="input-modern" value={meetingEndTime} onChange={e => setMeetingEndTime(e.target.value)} />
                            </div>
                        </div>

                        {roomAvailable !== null && (
                            <div className={`alert ${roomAvailable ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                                {roomAvailable ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                <span>{roomAvailable ? 'Room is available!' : 'Room is already booked for this time slot.'}</span>
                            </div>
                        )}

                        <button className="btn-ui btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}
                            onClick={handleBookRoom}
                            disabled={!selectedRoom || !selectedDate || loading || roomAvailable === false}
                            data-testid="book-meeting-room-btn"
                        >
                            {loading ? 'Booking...' : 'Book Meeting Room'}
                        </button>

                        {!selectedDate && (
                            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
                                Click a date on the calendar to start booking.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* My Bookings Table */}
            <div className="card-modern" style={{ padding: 0, marginTop: '2rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: 'hsl(142.1 76.2% 36.3% / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={18} style={{ color: 'hsl(142.1, 76.2%, 36.3%)' }} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>My Meeting Room Bookings</h3>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{meetingRoomBookings.length} booking{meetingRoomBookings.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <table className="table-ui">
                    <thead><tr><th>Date</th><th>Room</th><th>Time</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
                    <tbody>
                        {meetingRoomBookings.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>No meeting room bookings yet. Pick a date and room above!</td></tr>
                        ) : meetingRoomBookings.map(r => (
                            <tr key={r.id}>
                                <td style={{ fontWeight: 600 }}>{r.date}</td>
                                <td><div className="badge-ui badge-success">🏢 {r.meetingRoomName}</div></td>
                                <td style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Clock size={14} /> {r.startTime?.substring(0,5)} — {r.endTime?.substring(0,5)}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="btn-ui btn-ghost btn-sm" style={{ color: 'hsl(var(--destructive))' }} onClick={() => handleCancelBooking(r.id)}>Cancel</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
