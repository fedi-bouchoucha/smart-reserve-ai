import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, X, CheckCircle2, AlertCircle, Layers,
  MapPin, Calendar, Info, Sparkles
} from 'lucide-react';
import SmartSuggestModal from '../components/SmartSuggestModal';

const DESKS_DATA = [
  { id: '38', x: 40, y: 60, w: 45, h: 32, color: 'blue' },
  { id: '37', x: 90, y: 60, w: 45, h: 32, color: 'blue' },
  { id: '36', x: 140, y: 60, w: 45, h: 32, color: 'blue' },
  { id: '32', x: 40, y: 97, w: 45, h: 32, color: 'blue' },
  { id: '31', x: 90, y: 97, w: 45, h: 32, color: 'blue' },
  { id: '30', x: 140, y: 97, w: 45, h: 32, color: 'blue' },

  { id: '35', x: 290, y: 60, w: 45, h: 32, color: 'blue' },
  { id: '29', x: 290, y: 97, w: 45, h: 32, color: 'blue' },
  { id: '34', x: 374, y: 60, w: 45, h: 32, color: 'blue' },
  { id: '33', x: 424, y: 60, w: 45, h: 32, color: 'blue' },
  { id: '28', x: 374, y: 97, w: 45, h: 32, color: 'blue' },
  { id: '27', x: 424, y: 97, w: 45, h: 32, color: 'blue' },

  { id: '26', x: 40, y: 200, w: 45, h: 32, color: 'blue' },
  { id: '25', x: 90, y: 200, w: 45, h: 32, color: 'blue' },
  { id: '24', x: 140, y: 200, w: 45, h: 32, color: 'blue' },
  { id: '20', x: 40, y: 237, w: 45, h: 32, color: 'blue' },
  { id: '19', x: 90, y: 237, w: 45, h: 32, color: 'blue' },
  { id: '18', x: 140, y: 237, w: 45, h: 32, color: 'blue' },

  { id: '23', x: 290, y: 200, w: 45, h: 32, color: 'blue' },
  { id: '17', x: 290, y: 237, w: 45, h: 32, color: 'blue' },
  { id: '22', x: 374, y: 200, w: 45, h: 32, color: 'blue' },
  { id: '21', x: 424, y: 200, w: 45, h: 32, color: 'blue' },
  { id: '16', x: 374, y: 237, w: 45, h: 32, color: 'blue' },
  { id: '15', x: 424, y: 237, w: 45, h: 32, color: 'blue' },

  { id: '14', x: 40, y: 340, w: 45, h: 32, color: 'blue' },
  { id: '13', x: 90, y: 340, w: 45, h: 32, color: 'blue' },
  { id: '12', x: 140, y: 340, w: 45, h: 32, color: 'blue' },
  { id: '8',  x: 40, y: 377, w: 45, h: 32, color: 'blue' },
  { id: '7',  x: 90, y: 377, w: 45, h: 32, color: 'blue' },
  { id: '6',  x: 140, y: 377, w: 45, h: 32, color: 'blue' },

  { id: '11', x: 290, y: 340, w: 45, h: 32, color: 'blue' },
  { id: '5',  x: 290, y: 377, w: 45, h: 32, color: 'blue' },
  { id: '10', x: 374, y: 340, w: 45, h: 32, color: 'blue' },
  { id: '9',  x: 424, y: 340, w: 45, h: 32, color: 'blue' },
  { id: '4',  x: 374, y: 377, w: 45, h: 32, color: 'blue' },
  { id: '3',  x: 424, y: 377, w: 45, h: 32, color: 'blue' },

  { id: '2',  x: 485, y: 470, w: 45, h: 32, color: 'blue' },
  { id: '1',  x: 485, y: 507, w: 45, h: 32, color: 'red' },

  { id: '44', x: 640, y: 150, w: 45, h: 32, color: 'red' },
  { id: '43', x: 690, y: 150, w: 45, h: 32, color: 'red' },

  { id: '42', x: 640, y: 280, w: 68, h: 32, color: 'blue' },
  { id: '41', x: 713, y: 280, w: 68, h: 32, color: 'blue' },
  { id: '40', x: 640, y: 317, w: 68, h: 32, color: 'blue' },
  { id: '39', x: 713, y: 317, w: 68, h: 32, color: 'blue' },
];

const STATIC_SHAPES = [
  { id: 'manager', x: 207, y: 600, w: 208, h: 45, label: 'Manager Offices', type: 'outline_red' },
  { id: 'director', x: 40, y: 885, w: 168, h: 35, label: 'Director Office', type: 'yellow' },
  { id: 'iaf4', x: 40, y: 735, w: 168, h: 32, label: 'IAF4', type: 'green' },
  { id: 'iaf3', x: 40, y: 772, w: 168, h: 32, label: 'IAF3', type: 'green' },
  { id: 'iaf2', x: 40, y: 809, w: 168, h: 32, label: 'IAF2', type: 'green' },
  { id: 'iaf1', x: 40, y: 846, w: 168, h: 32, label: 'IAF1', type: 'green' },
  { id: 'iaf5', x: 765, y: 740, w: 110, h: 35, label: 'IAF5', type: 'pink' }
];

const SVG_W = 950;
const SVG_H = 960;

export default function OfficeMap({ pickerMode = false, pickerDate = null, onChairSelected = null, onClose = null }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    if (pickerMode && pickerDate) return pickerDate;
    const d = new Date(); d.setMonth(d.getMonth() + 1); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [availableChairs, setAvailableChairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [hoveredDesk, setHoveredDesk] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => { if (message.text) { const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000); return () => clearTimeout(t); } }, [message]);

  useEffect(() => {
    if (pickerMode && pickerDate) setSelectedDate(pickerDate);
  }, [pickerDate, pickerMode]);

  useEffect(() => { loadAvailability(); }, [selectedDate]);

  const loadAvailability = async () => {
    const selDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Past Date Check
    if (selDate < today) {
      setAvailableChairs([]);
      setMessage({ type: 'error', text: "Cannot reserve or view availability for past dates." });
      setLoading(false);
      return;
    }

    // 2. Weekend Check
    const day = selDate.getDay();
    if (day === 0 || day === 6) {
      setAvailableChairs([]);
      setMessage({ type: 'error', text: "The office is closed on weekends. No desks available." });
      setLoading(false);
      return;
    }

    // 3. Next Month Only Enforcement (Employees)
    if (user?.role === 'EMPLOYEE') {
      const currentYM = today.getFullYear() * 12 + today.getMonth();
      const selYM = selDate.getFullYear() * 12 + selDate.getMonth();
      
      if (selYM !== currentYM + 1) {
        setAvailableChairs([]);
        const nextMonthName = new Date(today.getFullYear(), today.getMonth() + 1).toLocaleDateString('en-US', { month: 'long' });
        setMessage({ 
          type: 'error', 
          text: `Desk reservations are currently only open for ${nextMonthName}.` 
        });
        setLoading(false);
        return;
      }

      // 4. Booking Window Warning (After 20th)
      if (today.getDate() > 20) {
        setMessage({
          type: 'info',
          text: "The regular booking window (1st-20th) has passed. Your reservation will require manager approval."
        });
      }
    }

    setLoading(true);
    try {
      const availRes = await api.get(`/reservations/available/chairs/${selectedDate}`);
      setAvailableChairs(availRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const emplacements = useMemo(() => {
    const map = {};
    for (let i = 1; i <= 44; i++) {
      const name = String(i);
      map[name] = { name, chairs: [] };
    }
    availableChairs.forEach(c => {
      const empName = c.emplacement?.name || c.emplacementName;
      if (map[empName]) {
        map[empName].floor = c.emplacement?.floor || c.floor;
        map[empName].emplacementId = c.emplacement?.id || c.emplacementId;
        map[empName].chairs.push({ id: c.id, number: c.number, available: true });
      }
    });
    Object.values(map).forEach(emp => {
      if (emp.chairs.length === 0) {
        emp.chairs.push({ id: null, number: 1, available: false });
      }
      
      let isAvailable = emp.chairs[0].available;
      
      // Enforce VIP Desk Restrictions
      if (user) {
        if (emp.name === "1" && user.username !== "employee63") isAvailable = false;
        if (emp.name === "43" && user.username !== "employee70") isAvailable = false;
        if (emp.name === "44" && user.username !== "employee71") isAvailable = false;
      }

      emp.available = isAvailable;
      emp.chairId = emp.chairs[0].id;
      emp.chairNumber = emp.chairs[0].number;
    });
    return map;
  }, [availableChairs]);

  const empList = useMemo(() => {
    let list = DESKS_DATA.map(d => ({ ...d, emp: emplacements[d.id] }));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e => e.id.includes(q));
    }
    if (filter === 'available') list = list.filter(e => e.emp?.available);
    else if (filter === 'full') list = list.filter(e => !e.emp?.available);
    return list;
  }, [emplacements, searchTerm, filter]);

  const filteredNames = new Set(empList.map(e => e.id));

  const getDeskStyle = (desk, emp) => {
    if (!emp?.available) return { fill: 'hsl(var(--muted))', stroke: 'hsl(var(--border))', text: 'hsl(var(--muted-foreground))' };
    
    if (desk.color === 'blue') return { fill: '#3b82f6', stroke: '#2563eb', text: 'white' };
    if (desk.color === 'red') return { fill: '#ef4444', stroke: '#dc2626', text: 'white' };
    return { fill: 'hsl(var(--primary))', stroke: 'hsl(var(--primary))', text: 'white' };
  };

  const handleDeskClick = (deskId, emp) => {
    setSelectedDesk({ deskId, emp });
  };

  const handleBookChair = async (chairId) => {
    if (!chairId) return;
    if (pickerMode && onChairSelected) {
      onChairSelected({ id: chairId, number: selectedDesk.emp.chairNumber, floor: 3, emplacementName: selectedDesk.deskId });
      return;
    }
    setBookingLoading(true);
    try {
      await api.post('/reservations', {
        chairId: chairId,
        meetingRoomId: null,
        date: selectedDate,
        startTime: '09:00',
        endTime: '17:00'
      });
      setMessage({ type: 'success', text: `Desk ${selectedDesk.deskId} booked for ${selectedDate}!` });
      loadAvailability();
      setSelectedDesk(null);
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Booking failed' });
    }
    setBookingLoading(false);
  };

  const handleMouseEnter = (deskId, emp, evt) => {
    setHoveredDesk(deskId);
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      setTooltip({ text: `Desk ${deskId} — ${emp?.available ? 'Available' : 'Occupied'}`, x: evt.clientX - svgRect.left, y: evt.clientY - svgRect.top - 12 });
    }
  };

  const stats = useMemo(() => {
    const all = Object.values(emplacements);
    return {
      total: 44,
      available: all.filter(e => e.available).length,
      full: all.filter(e => !e.available).length,
    };
  }, [emplacements]);

  return (
    <div className={pickerMode ? '' : 'animate-in'}>
      {!pickerMode && (
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={28} /> Office Map
          </h1>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Floor 3 — Interactive desk reservation</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input className="input-modern" placeholder="Search desk..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '200px' }} />
          </div>
          <input type="date" className="input-modern" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: '170px' }} />
        </div>
      </div>
      )}

      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {pickerMode && (
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input className="input-modern" placeholder="Search desk..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2rem', width: '160px', height: '32px', fontSize: '0.8rem' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ key: 'all', label: 'All' }, { key: 'available', label: `Available (${stats.available})` }, { key: 'full', label: `Occupied (${stats.full})` }].map(f => (
            <button key={f.key} className={`btn-ui btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#3b82f6' }} /> Available</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'hsl(var(--muted))' }} /> Occupied</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'hsl(var(--primary))' }} /> Selected</span>
          <button 
            onClick={() => setIsSuggestModalOpen(true)}
            className="btn-ui btn-primary btn-sm" 
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', display: 'flex', gap: '0.4rem', alignItems: 'center', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)' }}
          >
            <Sparkles size={14} /> AI Smart Suggest
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDesk ? '1fr 360px' : '1fr', gap: '1.5rem', transition: 'all 0.3s ease' }}>

        <div className="card-modern" style={{ padding: '1rem', overflow: 'hidden', position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'hsl(var(--background) / 0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Loading availability...</div>
            </div>
          )}
          <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', cursor: 'default' }}
            role="img" aria-label="Office floor plan">

            {/* Background */}
            <rect x="0" y="0" width={SVG_W} height={SVG_H} rx="12" fill="hsl(var(--secondary))" opacity="0.3" />

            {/* Title Main floor */}
            <text x="35" y="35" fontSize="16" fontWeight="700" fill="hsl(var(--muted-foreground))">Main floor</text>
            
            {/* Title Side / Design center */}
            <text x="650" y="35" fontSize="16" fontWeight="700" fill="hsl(var(--muted-foreground))">Side / Design center</text>
            <text x="630" y="110" fontSize="14" fontWeight="600" fill="hsl(var(--muted-foreground))">Design center</text>
            <text x="630" y="250" fontSize="14" fontWeight="600" fill="hsl(var(--muted-foreground))">24/7</text>

            {/* Divider line */}
            <line x1="600" y1="20" x2="600" y2={SVG_H - 100} stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />

            {/* Desks */}
            {DESKS_DATA.map((desk) => {
              const emp = emplacements[desk.id];
              const isSelected = selectedDesk?.deskId === desk.id;
              const isHovered = hoveredDesk === desk.id;
              const isVisible = filteredNames.has(desk.id);
              const colors = getDeskStyle(desk, emp);

              return (
                <g key={desk.id} style={{ cursor: emp?.available ? 'pointer' : 'not-allowed', opacity: isVisible ? 1 : 0.15, transition: 'opacity 0.3s ease' }}
                  onClick={() => handleDeskClick(desk.id, emp)}
                  onMouseEnter={(e) => handleMouseEnter(desk.id, emp, e.nativeEvent)}
                  onMouseLeave={() => { setHoveredDesk(null); setTooltip(null); }}
                >
                  {(isSelected || isHovered) && emp?.available && (
                    <rect x={desk.x - 4} y={desk.y - 4} width={desk.w + 8} height={desk.h + 8} rx="6"
                      fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6">
                      <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
                    </rect>
                  )}
                  <rect x={desk.x} y={desk.y} width={desk.w} height={desk.h} rx="4"
                    fill={isSelected ? 'hsl(var(--primary))' : colors.fill}
                    stroke={isSelected ? 'hsl(var(--primary))' : colors.stroke}
                    strokeWidth="1"
                    opacity={emp?.available ? 0.9 : 0.5}
                  />
                  <text x={desk.x + desk.w / 2} y={desk.y + desk.h / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700"
                    fill={colors.text}>{desk.id}</text>
                </g>
              );
            })}

            {/* Static Shapes */}
            {STATIC_SHAPES.map(shape => {
              let fill, stroke;
              if (shape.type === 'outline_red') { fill = 'hsl(10, 100%, 95%)'; stroke = '#f87171'; }
              else if (shape.type === 'yellow') { fill = '#fcd34d'; stroke = '#fbbf24'; }
              else if (shape.type === 'green') { fill = '#a3e635'; stroke = '#65a30d'; }
              else if (shape.type === 'pink') { fill = '#f472b6'; stroke = '#db2777'; }

              return (
                <g key={shape.id}>
                  <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx="4"
                    fill={fill} stroke={stroke} strokeWidth="1" opacity="0.9" />
                  <text x={shape.x + shape.w / 2} y={shape.y + shape.h / 2 + 5} textAnchor="middle" fontSize="12" fontWeight="700"
                    fill={shape.type === 'outline_red' ? '#b91c1c' : (shape.type === 'yellow' ? '#000' : '#fff')}>{shape.label}</text>
                </g>
              )
            })}

          </svg>

          {tooltip && (
            <div style={{
              position: 'absolute', left: tooltip.x, top: tooltip.y,
              transform: 'translate(-50%, -100%)',
              background: 'hsl(var(--foreground))', color: 'hsl(var(--background))',
              padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
              pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 20,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {tooltip.text}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedDesk && (
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
              className="card-modern" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Desk {selectedDesk.deskId}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Floor 3</p>
                </div>
                <button className="btn-ui btn-ghost" style={{ padding: '0.25rem' }} onClick={() => setSelectedDesk(null)}><X size={18} /></button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.6rem', background: 'hsl(var(--secondary))', borderRadius: 'var(--radius)', fontSize: '0.8rem' }}>
                <Calendar size={14} style={{ color: 'hsl(var(--primary))' }} />
                <span style={{ fontWeight: 600 }}>{new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)',
                  background: selectedDesk.emp?.available ? 'hsl(var(--success) / 0.04)' : 'hsl(var(--destructive) / 0.04)',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: selectedDesk.emp?.available ? 'hsl(var(--success) / 0.12)' : 'hsl(var(--destructive) / 0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Layers size={14} style={{ color: selectedDesk.emp?.available ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Status</div>
                      <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                        {selectedDesk.emp?.available ? '✓ Available' : '✕ Occupied'}
                      </div>
                    </div>
                  </div>
                  {selectedDesk.emp?.available && (
                    <button className="btn-ui btn-primary btn-sm" onClick={() => handleBookChair(selectedDesk.emp.chairId)} disabled={bookingLoading}>
                      {bookingLoading ? '...' : (pickerMode ? 'Select' : 'Book')}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'hsl(var(--muted) / 0.3)', borderRadius: 'var(--radius)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Info size={14} style={{ color: 'hsl(var(--primary))', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', margin: 0, lineHeight: 1.5 }}>
                  Booking is for the full day (09:00–17:00).
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!pickerMode && (
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Desks', value: stats.total, color: 'hsl(var(--foreground))' },
          { label: 'Available', value: stats.available + ' desks', color: 'hsl(var(--success))' },
          { label: 'Occupied', value: stats.full + ' desks', color: 'hsl(var(--destructive))' },
          { label: 'Occupancy', value: Math.round((stats.full / stats.total) * 100) + '%', color: 'hsl(var(--primary))' }
        ].map(s => (
          <div key={s.label} className="card-modern" style={{ flex: 1, minWidth: '140px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>
      )}
      <SmartSuggestModal 
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        selectedDate={selectedDate}
        availableDesks={empList.filter(e => e.emp?.available)}
        onBook={(deskId) => {
          setIsSuggestModalOpen(false);
          const emp = emplacements[deskId];
          handleDeskClick(deskId, emp);
          if (emp && emp.chairId) {
             handleBookChair(emp.chairId);
          }
        }}
      />
    </div>
  );
}
