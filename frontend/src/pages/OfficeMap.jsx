import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, X, CheckCircle2, AlertCircle, Layers,
  MapPin, Monitor, Coffee, ChevronRight, Calendar, Clock, Info
} from 'lucide-react';

// Grid config: 5 columns x 4 rows = 20 emplacements
const COLS = 5, ROWS = 4;
const DESK_W = 88, DESK_H = 56;
const GAP_X = 14, GAP_Y = 14;
const MARGIN_X = 80, MARGIN_Y = 90;
const AISLE_AFTER_COL = 4; // extra gap after column 5
const AISLE_EXTRA = 40;

function deskPos(index) {
  const col = index % COLS, row = Math.floor(index / COLS);
  const x = MARGIN_X + col * (DESK_W + GAP_X) + (col > AISLE_AFTER_COL ? AISLE_EXTRA : 0);
  const y = MARGIN_Y + row * (DESK_H + GAP_Y);
  return { x, y, col, row };
}

const CHAIR_OFFSETS = [
  { dx: 14, dy: -8 }, { dx: 42, dy: -8 },
  { dx: 14, dy: DESK_H + 2 }, { dx: 42, dy: DESK_H + 2 }
];

const SVG_W = MARGIN_X * 2 + COLS * DESK_W + (COLS - 1) * GAP_X + AISLE_EXTRA;
const SVG_H = MARGIN_Y + ROWS * (DESK_H + GAP_Y) + 60;

export default function OfficeMap({ pickerMode = false, pickerDate = null, onChairSelected = null, onClose = null }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    if (pickerMode && pickerDate) return pickerDate;
    const d = new Date(); d.setMonth(d.getMonth() + 1); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [availableChairs, setAvailableChairs] = useState([]);
  const [allChairs, setAllChairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [hoveredDesk, setHoveredDesk] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => { if (message.text) { const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000); return () => clearTimeout(t); } }, [message]);

  useEffect(() => {
    if (pickerMode && pickerDate) setSelectedDate(pickerDate);
  }, [pickerDate, pickerMode]);

  useEffect(() => { loadAvailability(); }, [selectedDate]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const [availRes, allRes] = await Promise.all([
        api.get(`/reservations/available/chairs/${selectedDate}`),
        api.get(`/reservations/available/chairs/2000-01-01`).catch(() => ({ data: [] }))
      ]);
      setAvailableChairs(availRes.data || []);
      // Build full chair list from available on a far-future date (gets all)
      // Fallback: use available as reference
      setAllChairs(availRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Build emplacement map: { "E01": { id, name, floor, chairs: [{id, number, available}] } }
  const emplacements = useMemo(() => {
    const map = {};
    const availIds = new Set(availableChairs.map(c => c.id));
    // We need all chairs. Since API only returns available, we infer from chair numbering.
    // Each emplacement E01-E80 has chairs 1-4.
    for (let i = 1; i <= 20; i++) {
      const name = `E${String(i).padStart(2, '0')}`;
      map[name] = { name, index: i - 1, chairs: [] };
    }
    availableChairs.forEach(c => {
      const empName = c.emplacementName;
      if (map[empName]) {
        map[empName].floor = c.floor;
        map[empName].emplacementId = c.emplacementId;
        if (!map[empName].chairs.find(ch => ch.id === c.id)) {
          map[empName].chairs.push({ id: c.id, number: c.number, available: true });
        }
      }
    });
    // Fill missing chairs (chairs 1-4 that are NOT available = occupied)
    Object.values(map).forEach(emp => {
      const existing = new Set(emp.chairs.map(c => c.number));
      for (let n = 1; n <= 4; n++) {
        if (!existing.has(n)) {
          emp.chairs.push({ id: null, number: n, available: false });
        }
      }
      emp.chairs.sort((a, b) => a.number - b.number);
      emp.availableCount = emp.chairs.filter(c => c.available).length;
      emp.status = emp.availableCount === 4 ? 'available' : emp.availableCount > 0 ? 'partial' : 'full';
    });
    return map;
  }, [availableChairs]);

  const empList = useMemo(() => {
    let list = Object.values(emplacements);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q));
    }
    if (filter === 'available') list = list.filter(e => e.status === 'available');
    else if (filter === 'partial') list = list.filter(e => e.status === 'partial');
    else if (filter === 'full') list = list.filter(e => e.status === 'full');
    return list;
  }, [emplacements, searchTerm, filter]);

  const filteredNames = new Set(empList.map(e => e.name));

  const statusColor = (status) => {
    if (status === 'available') return { fill: 'hsl(142, 71%, 45%)', stroke: 'hsl(142, 71%, 35%)' };
    if (status === 'partial') return { fill: 'hsl(38, 92%, 50%)', stroke: 'hsl(38, 92%, 40%)' };
    return { fill: 'hsl(0, 84%, 60%)', stroke: 'hsl(0, 84%, 50%)' };
  };

  const handleDeskClick = (emp) => {
    setSelectedDesk(emp);
  };

  const handleBookChair = async (chair) => {
    if (!chair.available || !chair.id) return;
    // In picker mode, just return the selection to parent
    if (pickerMode && onChairSelected) {
      onChairSelected({ id: chair.id, number: chair.number, floor: selectedDesk.floor || 3, emplacementName: selectedDesk.name });
      return;
    }
    setBookingLoading(true);
    try {
      await api.post('/reservations', {
        chairId: chair.id,
        meetingRoomId: null,
        date: selectedDate,
        startTime: '09:00',
        endTime: '17:00'
      });
      setMessage({ type: 'success', text: `Desk ${selectedDesk.name} / Chair ${chair.number} booked for ${selectedDate}!` });
      loadAvailability();
      setSelectedDesk(prev => prev ? { ...prev } : null);
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Booking failed' });
    }
    setBookingLoading(false);
  };

  const handleMouseEnter = (emp, evt) => {
    setHoveredDesk(emp.name);
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      setTooltip({ text: `${emp.name} — ${emp.availableCount}/4 available`, x: evt.clientX - svgRect.left, y: evt.clientY - svgRect.top - 12 });
    }
  };

  const stats = useMemo(() => {
    const all = Object.values(emplacements);
    return {
      total: 20,
      available: all.filter(e => e.status === 'available').length,
      partial: all.filter(e => e.status === 'partial').length,
      full: all.filter(e => e.status === 'full').length,
      totalChairs: 80,
      availChairs: all.reduce((s, e) => s + e.availableCount, 0)
    };
  }, [emplacements]);

  return (
    <div className={pickerMode ? '' : 'animate-in'}>
      {/* Header — hidden in picker mode */}
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

      {/* Message */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats + Filters — show search/filters inline in picker mode */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {pickerMode && (
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input className="input-modern" placeholder="Search desk..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2rem', width: '160px', height: '32px', fontSize: '0.8rem' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ key: 'all', label: 'All' }, { key: 'available', label: `Available (${stats.available})` }, { key: 'partial', label: `Partial (${stats.partial})` }, { key: 'full', label: `Full (${stats.full})` }].map(f => (
            <button key={f.key} className={`btn-ui btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'hsl(142,71%,45%)' }} /> Available</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'hsl(38,92%,50%)' }} /> Partial</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'hsl(0,84%,60%)' }} /> Full</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'hsl(var(--primary))' }} /> Selected</span>
        </div>
      </div>

      {/* Main Layout: SVG + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedDesk ? '1fr 360px' : '1fr', gap: '1.5rem', transition: 'all 0.3s ease' }}>

        {/* SVG Floor Plan */}
        <div className="card-modern" style={{ padding: '1rem', overflow: 'hidden', position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'hsl(var(--background) / 0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Loading availability...</div>
            </div>
          )}
          <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', cursor: 'default' }}
            role="img" aria-label="Office floor plan with 20 desks">

            {/* Background */}
            <rect x="0" y="0" width={SVG_W} height={SVG_H} rx="12" fill="hsl(var(--secondary))" opacity="0.5" />

            {/* Room outline */}
            <rect x="20" y="20" width={SVG_W - 40} height={SVG_H - 40} rx="8" fill="none" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 3" />

            {/* Floor label */}
            <text x={SVG_W / 2} y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill="hsl(var(--muted-foreground))" opacity="0.3">FLOOR 3 — OPEN SPACE</text>

            {/* Column labels */}
            {Array.from({ length: COLS }, (_, i) => {
              const x = MARGIN_X + i * (DESK_W + GAP_X) + (i > AISLE_AFTER_COL ? AISLE_EXTRA : 0) + DESK_W / 2;
              return <text key={`col-${i}`} x={x} y="78" textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(var(--muted-foreground))" opacity="0.4">{String.fromCharCode(65 + i)}</text>;
            })}

            {/* Row labels */}
            {Array.from({ length: ROWS }, (_, i) => {
              const y = MARGIN_Y + i * (DESK_H + GAP_Y) + DESK_H / 2 + 4;
              return <text key={`row-${i}`} x="50" y={y} textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(var(--muted-foreground))" opacity="0.4">{i + 1}</text>;
            })}

            {/* Aisle line */}
            <line x1={MARGIN_X + 5 * (DESK_W + GAP_X) - GAP_X / 2 + AISLE_EXTRA / 2} y1="85"
              x2={MARGIN_X + 5 * (DESK_W + GAP_X) - GAP_X / 2 + AISLE_EXTRA / 2} y2={SVG_H - 30}
              stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4 4" opacity="0.15" />

            {/* Desks */}
            {Array.from({ length: 20 }, (_, i) => {
              const name = `E${String(i + 1).padStart(2, '0')}`;
              const emp = emplacements[name];
              const pos = deskPos(i);
              const isSelected = selectedDesk?.name === name;
              const isHovered = hoveredDesk === name;
              const isVisible = filteredNames.has(name);
              const colors = statusColor(emp?.status || 'full');

              return (
                <g key={name} style={{ cursor: 'pointer', opacity: isVisible ? 1 : 0.15, transition: 'opacity 0.3s ease' }}
                  onClick={() => emp && handleDeskClick(emp)}
                  onMouseEnter={(e) => emp && handleMouseEnter(emp, e.nativeEvent)}
                  onMouseLeave={() => { setHoveredDesk(null); setTooltip(null); }}
                  role="button" tabIndex={isVisible ? 0 : -1} aria-label={`Desk ${name}, ${emp?.availableCount || 0} of 4 chairs available`}
                  onKeyDown={(e) => { if (e.key === 'Enter' && emp) handleDeskClick(emp); }}
                >
                  {/* Glow */}
                  {(isSelected || isHovered) && (
                    <rect x={pos.x - 4} y={pos.y - 4} width={DESK_W + 8} height={DESK_H + 8} rx="10"
                      fill="none" stroke={isSelected ? 'hsl(var(--primary))' : colors.stroke} strokeWidth="2" opacity="0.6">
                      <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
                    </rect>
                  )}

                  {/* Table body */}
                  <rect x={pos.x} y={pos.y} width={DESK_W} height={DESK_H} rx="6"
                    fill={isSelected ? 'hsl(var(--primary))' : colors.fill}
                    stroke={isSelected ? 'hsl(var(--primary))' : colors.stroke}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={isSelected ? 1 : 0.85}
                    style={{ transition: 'all 0.25s ease' }}
                  />

                  {/* Label */}
                  <text x={pos.x + DESK_W / 2} y={pos.y + DESK_H / 2 - 4} textAnchor="middle" fontSize="11" fontWeight="700"
                    fill={isSelected ? 'white' : 'white'} opacity="0.95">{name}</text>
                  <text x={pos.x + DESK_W / 2} y={pos.y + DESK_H / 2 + 10} textAnchor="middle" fontSize="8" fontWeight="500"
                    fill="white" opacity="0.7">{emp?.availableCount ?? 0}/4</text>

                  {/* Chair dots */}
                  {CHAIR_OFFSETS.map((off, ci) => {
                    const chair = emp?.chairs?.[ci];
                    return (
                      <circle key={ci} cx={pos.x + off.dx} cy={pos.y + off.dy} r="5"
                        fill={chair?.available ? 'hsl(142,71%,90%)' : 'hsl(0,60%,85%)'}
                        stroke={chair?.available ? 'hsl(142,71%,45%)' : 'hsl(0,60%,55%)'}
                        strokeWidth="1.5" opacity="0.9" />
                    );
                  })}
                </g>
              );
            })}

            {/* Meeting Room */}
            <rect x={SVG_W - 200} y={SVG_H - 80} width="160" height="50" rx="8"
              fill="hsl(var(--primary))" opacity="0.15" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="5 3" />
            <text x={SVG_W - 120} y={SVG_H - 50} textAnchor="middle" fontSize="11" fontWeight="700" fill="hsl(var(--primary))" opacity="0.7">Meeting Room</text>

            {/* Amenities */}
            <rect x="25" y={SVG_H - 60} width="50" height="30" rx="4" fill="hsl(var(--muted-foreground))" opacity="0.08" />
            <text x="50" y={SVG_H - 40} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.4">☕ Kitchen</text>

            <text x={SVG_W / 2} y={SVG_H - 20} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" opacity="0.3">↑ ENTRANCE</text>
          </svg>

          {/* Tooltip */}
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

        {/* Sidebar */}
        <AnimatePresence>
          {selectedDesk && (
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
              className="card-modern" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedDesk.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Floor 3 • {selectedDesk.availableCount}/4 chairs free</p>
                </div>
                <button className="btn-ui btn-ghost" style={{ padding: '0.25rem' }} onClick={() => setSelectedDesk(null)}><X size={18} /></button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.6rem', background: 'hsl(var(--secondary))', borderRadius: 'var(--radius)', fontSize: '0.8rem' }}>
                <Calendar size={14} style={{ color: 'hsl(var(--primary))' }} />
                <span style={{ fontWeight: 600 }}>{new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Chairs
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {selectedDesk.chairs.map(chair => (
                  <div key={chair.number} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)',
                    background: chair.available ? 'hsl(var(--success) / 0.04)' : 'hsl(var(--destructive) / 0.04)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: chair.available ? 'hsl(var(--success) / 0.12)' : 'hsl(var(--destructive) / 0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Layers size={14} style={{ color: chair.available ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Chair {chair.number}</div>
                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                          {chair.available ? '✓ Available' : '✕ Occupied'}
                        </div>
                      </div>
                    </div>
                    {chair.available && (
                      <button className="btn-ui btn-primary btn-sm" onClick={() => handleBookChair(chair)} disabled={bookingLoading}>
                        {bookingLoading ? '...' : (pickerMode ? 'Select' : 'Book')}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ padding: '0.75rem', background: 'hsl(var(--muted) / 0.3)', borderRadius: 'var(--radius)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Info size={14} style={{ color: 'hsl(var(--primary))', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', margin: 0, lineHeight: 1.5 }}>
                  Booking is for the full day (09:00–17:00). If the date has a Home Office assignment, booking will require manager approval.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom stats bar — hidden in picker mode */}
      {!pickerMode && (
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Desks', value: stats.total, color: 'hsl(var(--foreground))' },
          { label: 'Available', value: stats.availChairs + ' chairs', color: 'hsl(var(--success))' },
          { label: 'Occupied', value: (80 - stats.availChairs) + ' chairs', color: 'hsl(var(--destructive))' },
          { label: 'Occupancy', value: Math.round(((80 - stats.availChairs) / 80) * 100) + '%', color: 'hsl(var(--primary))' }
        ].map(s => (
          <div key={s.label} className="card-modern" style={{ flex: 1, minWidth: '140px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
