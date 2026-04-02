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
    const [selectedDates, setSelectedDates] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedChair, setSelectedChair] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [weeklyCounts, setWeeklyCounts] = useState({});
    const [monthAvailability, setMonthAvailability] = useState({});
    const [fullDates, setFullDates] = useState([]);
    
    // AI Features
    const [recommendations, setRecommendations] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [conflictData, setConflictData] = useState(null);

    // Change request modal
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [changeReservation, setChangeReservation] = useState(null);
    const [changeDate, setChangeDate] = useState('');
    const [changeChairId, setChangeChairId] = useState('');
    const [changeRoomId, setChangeRoomId] = useState('');

    useEffect(() => {
        loadReservations();
        loadChangeRequests();
        loadWeeklyCounts();
        loadRecommendations();
    }, []);

    useEffect(() => {
        loadFullDatesForMonth();
    }, [currentMonth]);

    useEffect(() => {
        if (selectedDates.length > 0) {
            loadAvailability();
        } else {
            setChairs([]);
            setRooms([]);
        }
    }, [selectedDates]);

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

    const loadWeeklyCounts = async () => {
        try {
            const res = await api.get('/reservations/my/weekly-counts');
            setWeeklyCounts(res.data);
        } catch (e) { console.error(e); }
    };

    const loadRecommendations = async () => {
        try {
            const res = await api.get('/reservations/recommendations');
            setRecommendations(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchSuggestions = async (date) => {
        try {
            const res = await api.get(`/reservations/smart-schedule?date=${date}&duration=480`);
            setSuggestions(res.data);
        } catch (e) { console.error(e); }
    };

    const loadFullDatesForMonth = async () => {
        try {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const monthAvail = {};
            const fullDatesArr = [];
            
            // Loop through each day. In a real app we would have a bulk availability endpoint
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month, d);
                if (date.getDay() === 0 || date.getDay() === 6) continue;
                
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                
                // Fetch basic availability info for the whole month to show icons
                try {
                    const [chairsRes, roomsRes] = await Promise.all([
                        api.get(`/reservations/available/chairs/${dateStr}`),
                        api.get(`/reservations/available/rooms/${dateStr}`)
                    ]);
                    const hasChairs = chairsRes.data.length > 0;
                    const hasRooms = roomsRes.data.length > 0;
                    monthAvail[dateStr] = { hasChairs, hasRooms };
                    if (!hasChairs && !hasRooms) {
                        fullDatesArr.push(dateStr);
                    }
                } catch (e) { /* ignore individual day failures */ }
            }
            setMonthAvailability(monthAvail);
            setFullDates(fullDatesArr);
        } catch (e) { console.error(e); }
    };

    const loadAvailability = async () => {
        try {
            const availabilityPromises = selectedDates.map(date => 
                Promise.all([
                    api.get(`/reservations/available/chairs/${date}`),
                    api.get(`/reservations/available/rooms/${date}`)
                ])
            );
            
            const results = await Promise.all(availabilityPromises);
            
            if (results.length === 0) return;
            
            // Find intersection to ensure the resource is available for ALL selected dates
            let commonChairs = results[0][0].data;
            let commonRooms = results[0][1].data;
            
            for (let i = 1; i < results.length; i++) {
                const dayChairs = results[i][0].data;
                const dayRooms = results[i][1].data;
                
                commonChairs = commonChairs.filter(c1 => dayChairs.some(c2 => c2.id === c1.id));
                commonRooms = commonRooms.filter(r1 => dayRooms.some(r2 => r2.id === r1.id));
            }
            
            setChairs(commonChairs);
            setRooms(commonRooms);
        } catch (e) { console.error(e); }
    };

    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        let startingDay = firstDay.getDay() - 1;
        if (startingDay === -1) startingDay = 6;
        const days = [];
        for (let i = 0; i < startingDay; i++) { days.push(null); }
        for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)); }
        return days;
    };

    const formatDateStr = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const toggleDate = (date) => {
        if (!date) return;
        if (date.getDay() === 0 || date.getDay() === 6) return;
        const dateStr = formatDateStr(date);
        setSelectedDates(prev => {
            if (prev.includes(dateStr)) return prev.filter(d => d !== dateStr);
            return [...prev, dateStr];
        });
        
        // Reset selections on date change since availability may change
        setSelectedChair(null);
        setSelectedRoom(null);
        fetchSuggestions(dateStr);
    };

    const handleReserve = async () => {
        setLoading(true);
        try {
            await api.post('/reservations/bulk', {
                dates: selectedDates,
                chairId: selectedChair,
                meetingRoomId: selectedRoom,
                startTime: startTime,
                endTime: endTime
            });
            setMessage({ type: 'success', text: 'Reservation created!' });
            setSelectedDates([]);
            setSuggestions([]);
            loadReservations();
        } catch (e) {
            if (e.response?.status === 409) {
                setConflictData(e.response.data);
            } else {
                setMessage({ type: 'error', text: 'Failed to create reservation' });
            }
        } finally { setLoading(false); }
    };

    const renderConflictModal = () => (
        <div className="modal-overlay" onClick={() => setConflictData(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>⚠️ Conflict</h2>
                <p>{conflictData.error}</p>
                {conflictData.alternatives?.map((alt, i) => (
                    <div key={i} className="card" onClick={() => { setStartTime(alt.startTime); setEndTime(alt.endTime); setConflictData(null); }}>
                        {alt.reasoning} ({alt.startTime} - {alt.endTime})
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div className="page-header"><h1>My Workspace</h1></div>
            
            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="tabs">
                <button className={`tab-btn ${tab === 'reservations' ? 'active' : ''}`} onClick={() => setTab('reservations')}>My Reservations</button>
                <button className={`tab-btn ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>New Reservation</button>
            </div>

            {tab === 'reservations' && (
                <div className="card">
                    <table>
                        <thead><tr><th>Date</th><th>Resource</th></tr></thead>
                        <tbody>
                            {reservations.map(r => (
                                <tr key={r.id}><td>{r.date} ({r.startTime?.substring(0,5)} - {r.endTime?.substring(0,5)})</td><td>{r.chairInfo || r.meetingRoomName}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'new' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.5fr) 1fr', gap: '24px', alignItems: 'start' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3>📅 Select Your Dates</h3>
                            <div className="actions-row">
                                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>&lt;</button>
                                <span style={{ fontWeight: '600', minWidth: '120px', textAlign: 'center' }}>
                                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>&gt;</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '24px' }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{day}</div>
                            ))}
                            {generateCalendarDays().map((d, i) => {
                                if (!d) return <div key={i} />;
                                const dateStr = formatDateStr(d);
                                const isSelected = selectedDates.includes(dateStr);
                                const isReserved = reservations.some(r => r.date === dateStr);
                                const avail = monthAvailability[dateStr];
                                const isFull = fullDates.includes(dateStr);

                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => toggleDate(d)} 
                                        className={`calendar-day ${isSelected ? 'selected' : ''} ${isReserved ? 'reserved' : ''}`} 
                                        style={{ 
                                            padding: '12px 8px', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: 'var(--radius-sm)',
                                            textAlign: 'center', 
                                            cursor: 'pointer',
                                            position: 'relative',
                                            background: isSelected ? 'var(--accent)' : isReserved ? 'var(--bg-secondary)' : isFull ? 'var(--danger-bg)' : 'transparent',
                                            color: isSelected ? 'white' : 'inherit',
                                            transition: 'all 0.2s',
                                            opacity: isFull ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{d.getDate()}</div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', height: '12px', marginTop: '4px' }}>
                                            {!isSelected && avail?.hasChairs && <span style={{ fontSize: '0.6rem' }} title="Chairs available">🪑</span>}
                                            {!isSelected && avail?.hasRooms && <span style={{ fontSize: '0.6rem' }} title="Rooms available">🏢</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedDates.length > 0 && (
                            <div className="unified-resource-view" style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <h4 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>🪑 Available Chairs</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {chairs.length === 0 ? <p className="empty-state" style={{ padding: '20px' }}>No chairs available</p> : 
                                                chairs.map(c => (
                                                <div 
                                                    key={c.id} 
                                                    className={`resource-card ${selectedChair === c.id ? 'selected' : ''}`}
                                                    onClick={() => { setSelectedChair(c.id); setSelectedRoom(null); }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <h4>Chair {c.number}</h4>
                                                        {selectedChair === c.id && <span className="badge badge-success">Selected</span>}
                                                    </div>
                                                    <p>{c.emplacementName} • Floor {c.floor}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>🏢 Meeting Rooms</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {rooms.length === 0 ? <p className="empty-state" style={{ padding: '20px' }}>No rooms available</p> : 
                                                rooms.map(r => (
                                                <div 
                                                    key={r.id} 
                                                    className={`resource-card ${selectedRoom === r.id ? 'selected' : ''}`}
                                                    onClick={() => { setSelectedRoom(r.id); setSelectedChair(null); }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <h4>{r.name}</h4>
                                                        {selectedRoom === r.id && <span className="badge badge-success">Selected</span>}
                                                    </div>
                                                    <p>Capacity: {r.capacity} • Floor {r.floor}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ position: 'sticky', top: '24px' }}>
                        <div className="card-header">
                            <h3>⚡ Quick Action</h3>
                        </div>
                        
                        <div className="form-group">
                            <label>Arrival Time</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label>Departure Time</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>

                        {(selectedChair || selectedRoom) && (
                            <div className="selection-summary" style={{ 
                                padding: '16px', 
                                background: 'var(--bg-secondary)', 
                                borderRadius: 'var(--radius-sm)',
                                borderLeft: '4px solid var(--accent)',
                                marginBottom: '24px'
                            }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>You are reserving:</p>
                                <p style={{ fontWeight: '700', fontSize: '1rem' }}>
                                    {selectedChair ? `🪑 Chair ${chairs.find(c => c.id === selectedChair)?.number}` : 
                                     `🏢 Meeting Room ${rooms.find(r => r.id === selectedRoom)?.name}`}
                                </p>
                                <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
                                    For <strong>{selectedDates.length}</strong> date(s)
                                </p>
                            </div>
                        )}

                        <button 
                            className="btn btn-primary btn-full" 
                            onClick={handleReserve} 
                            disabled={loading || (!selectedChair && !selectedRoom)}
                        >
                            {loading ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Confirming...</> : 'Confirm Reservation'}
                        </button>
                        
                        {suggestions.length > 0 && (
                            <div style={{marginTop:'20px'}}>
                                <h5>💡 Smart Suggestions</h5>
                                {suggestions.map((s,i) => <div key={i} onClick={() => {setStartTime(s.startTime.substring(0,5)); setEndTime(s.endTime.substring(0,5));}} style={{cursor:'pointer', padding:'5px', borderBottom:'1px solid var(--border)'}}>{s.startTime.substring(0,5)} - {s.endTime.substring(0,5)}</div>)}
                            </div>
                        )}

                        {recommendations && (
                            <div style={{marginTop:'20px', padding:'10px', background:'rgba(var(--accent-rgb),0.1)'}}>
                                <h5>⭐ Recommendations</h5>
                                <p>{recommendations.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {conflictData && renderConflictModal()}
        </div>
    );
}
