import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  ChevronRight,
  RefreshCcw,
  X,
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// ============= HELPER COMPONENTS =============

function ScoreGauge({ score, size = 80, strokeWidth = 6, large = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const color = score >= 8 ? '#10b981' : score >= 6 ? '#6366f1' : score >= 4 ? '#f59e0b' : '#ef4444';

  return (
    <div className={`score-gauge ${large ? 'score-gauge-lg' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="score-gauge-label">
        <motion.span className="score-gauge-value" style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="score-gauge-sublabel">/ 10</span>
      </div>
    </div>
  );
}

function TierBadge({ tier }) {
  const tierMap = {
    'Top Performer': { className: 'tier-top', icon: '🏆' },
    'Solid Performer': { className: 'tier-solid', icon: '✦' },
    'Needs Improvement': { className: 'tier-improvement', icon: '📈' },
    'Needs Support': { className: 'tier-support', icon: '🤝' },
  };
  const config = tierMap[tier] || tierMap['Solid Performer'];
  return (
    <span className={`tier-badge ${config.className}`}>
      <span>{config.icon}</span>
      <span>{tier}</span>
    </span>
  );
}

function TrendArrow({ trend }) {
  const config = {
    improving: { icon: TrendingUp, label: 'Improving', cls: 'trend-improving' },
    stable: { icon: Minus, label: 'Stable', cls: 'trend-stable' },
    declining: { icon: TrendingDown, label: 'Declining', cls: 'trend-declining' },
  };
  const c = config[trend] || config.stable;
  return (
    <span className={`trend-indicator ${c.cls}`}>
      <c.icon size={14} />
      <span>{c.label}</span>
    </span>
  );
}

function MetricBar({ label, value, max = 10, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="metric-item">
      <div className="metric-item-label">
        <span>{label}</span>
        <span className="metric-item-value" style={{ color }}>{value}/{max}</span>
      </div>
      <div className="metric-bar-track">
        <motion.div className="metric-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function MiniSparkline({ data }) {
  if (!data || data.length < 2) return null;
  const chartData = data.map((v, i) => ({ w: i, s: v }));
  return (
    <div className="sparkline-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="s" stroke="hsl(var(--primary))"
            strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============= TEAM HEALTH RING =============

function TeamHealthRing({ score }) {
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;

  return (
    <div className="team-health-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.3} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="url(#healthGradient)" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="team-health-label">
        <motion.div className="team-health-score"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {score}
        </motion.div>
        <div className="team-health-subtitle">Team Score</div>
      </div>
    </div>
  );
}

// ============= TIER DISTRIBUTION BAR =============

function TierDistributionBar({ distribution }) {
  if (!distribution) return null;
  const total = distribution.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '3px', height: '24px', borderRadius: 'var(--radius)', overflow: 'hidden', marginTop: '0.75rem' }}>
      {distribution.filter(d => d.count > 0).map((d, i) => (
        <motion.div key={i}
          initial={{ width: 0 }}
          animate={{ width: `${(d.count / total) * 100}%` }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
          style={{
            background: d.color,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.625rem',
            fontWeight: 700,
            color: 'white',
            minWidth: d.count > 0 ? '24px' : '0',
          }}
          title={`${d.tier}: ${d.count}`}
        >
          {d.count}
        </motion.div>
      ))}
    </div>
  );
}


// ============= MAIN COMPONENT =============

export default function PerformanceAnalytics() {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeReport, setEmployeeReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' | 'compare'

  useEffect(() => { loadTeamData(); }, []);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/performance/team');
      setTeamData(res.data);
    } catch (e) {
      console.error('Failed to load team performance:', e);
    }
    setLoading(false);
  };

  const loadEmployeeDetail = async (empId) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/performance/employee/${empId}`);
      setEmployeeReport(res.data);
      setSelectedEmployee(empId);
    } catch (e) {
      console.error('Failed to load employee report:', e);
    }
    setDetailLoading(false);
  };

  const getTierClass = (tier) => {
    if (tier === 'Top Performer') return 'perf-card-top';
    if (tier === 'Solid Performer') return 'perf-card-solid';
    if (tier === 'Needs Improvement') return 'perf-card-improvement';
    return 'perf-card-support';
  };

  const getBarColor = (score) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#6366f1';
    if (score >= 4) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Brain size={48} style={{ color: 'hsl(var(--primary))' }} />
        </motion.div>
        <span style={{ marginLeft: '1rem', fontSize: '1.125rem', color: 'hsl(var(--muted-foreground))' }}>
          SmartReserve AI is analyzing your team...
        </span>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '4rem' }}>
        <AlertTriangle size={48} style={{ color: 'hsl(var(--warning))', marginBottom: '1rem' }} />
        <h2>Unable to load performance data</h2>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>Please try refreshing the page.</p>
        <button className="btn-ui btn-primary" onClick={loadTeamData} style={{ marginTop: '1rem' }}>
          <RefreshCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* ============= HEADER ============= */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), #10b981)',
              padding: '0.5rem',
              borderRadius: '0.75rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Brain size={24} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Performance AI</h1>
            <span className="badge-ui badge-indigo" style={{ fontSize: '0.65rem', padding: '0.125rem 0.5rem' }}>
              <Sparkles size={10} /> Smart Analytics
            </span>
          </div>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            AI-powered behavioral insights for your team, {user?.fullName}.
          </p>
        </div>
        <button className="btn-ui btn-outline" onClick={loadTeamData}>
          <RefreshCcw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ============= TEAM OVERVIEW ============= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Health Ring Card */}
        <motion.div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <TeamHealthRing score={teamData.teamAverageScore} />
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <TrendArrow trend={teamData.teamTrend} />
          </div>
        </motion.div>

        {/* Team Stats Card */}
        <motion.div className="glass-card" style={{ padding: '2rem' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Users size={20} style={{ color: 'hsl(var(--primary))' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Team Overview</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{teamData.teamSize}</div>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Team Members</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
                {teamData.tierDistribution?.find(t => t.tier === 'Top Performer')?.count || 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Top Performers</div>
            </div>
          </div>
          <TierDistributionBar distribution={teamData.tierDistribution} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {teamData.tierDistribution?.map((t, i) => (
              <span key={i} style={{ fontSize: '0.625rem', color: t.color, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.color, display: 'inline-block' }} />
                {t.tier}: {t.count}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Insights Card */}
        <motion.div className="glass-card" style={{ padding: '2rem' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Lightbulb size={20} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Key Insights</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {teamData.outlierHighlights?.slice(0, 4).map((highlight, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{
                  fontSize: '0.825rem',
                  padding: '0.625rem 0.75rem',
                  background: 'hsl(var(--muted) / 0.5)',
                  borderRadius: 'var(--radius)',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}
              >
                <Zap size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'hsl(var(--primary))' }} />
                <span>{highlight}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============= VIEW TOGGLE ============= */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>
          <Target size={16} /> <span>Employee Cards</span>
        </button>
        <button className={`tab-btn ${view === 'compare' ? 'active' : ''}`} onClick={() => setView('compare')}>
          <BarChart3 size={16} /> <span>Team Comparison</span>
        </button>
      </div>

      {/* ============= EMPLOYEE CARDS GRID ============= */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {teamData.employees?.map((emp, index) => (
            <motion.div
              key={emp.employeeId}
              className={`perf-card ${getTierClass(emp.tier)}`}
              onClick={() => loadEmployeeDetail(emp.employeeId)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '999px',
                    background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1rem'
                  }}>
                    {emp.employeeName?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{emp.employeeName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>@{emp.username}</div>
                  </div>
                </div>
                <ScoreGauge score={emp.score} size={56} strokeWidth={4} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <TierBadge tier={emp.tier} />
                <TrendArrow trend={emp.trend} />
              </div>

              <MiniSparkline data={emp.trajectory} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                  View Report <ArrowUpRight size={12} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ============= TEAM COMPARISON VIEW ============= */}
      {view === 'compare' && (
        <motion.div className="card-modern" style={{ padding: '2rem' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...teamData.employees].sort((a, b) => b.score - a.score).map((emp, i) => (
              <motion.div key={emp.employeeId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                onClick={() => loadEmployeeDetail(emp.employeeId)}
              >
                <div style={{ width: '28px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>
                  #{i + 1}
                </div>
                <div style={{ width: '140px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: '999px',
                    background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: '0.75rem', flexShrink: 0
                  }}>
                    {emp.employeeName?.charAt(0)}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.employeeName}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <motion.div className="comparison-bar"
                    style={{ background: getBarColor(emp.score) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(emp.score / 10) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                  >
                    {emp.score}
                  </motion.div>
                </div>
                <div style={{ width: '100px' }}>
                  <TierBadge tier={emp.tier} />
                </div>
                <TrendArrow trend={emp.trend} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ============= EMPLOYEE DETAIL MODAL ============= */}
      <AnimatePresence>
        {selectedEmployee && employeeReport && (
          <div className="modal-modern-overlay" onClick={() => { setSelectedEmployee(null); setEmployeeReport(null); }}>
            <motion.div
              className="modal-modern-content perf-modal"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {detailLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Brain size={32} style={{ color: 'hsl(var(--primary))' }} />
                  </motion.div>
                  <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>Generating insights...</p>
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="perf-modal-header">
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <ScoreGauge score={employeeReport.score} size={72} strokeWidth={5} />
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.375rem' }}>
                          {employeeReport.employeeName}
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <TierBadge tier={employeeReport.tier} />
                          <TrendArrow trend={employeeReport.trend} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.375rem' }}>
                          Team: {employeeReport.team}
                        </div>
                      </div>
                    </div>
                    <X size={20} style={{ cursor: 'pointer', color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}
                      onClick={() => { setSelectedEmployee(null); setEmployeeReport(null); }} />
                  </div>

                  {/* Performance Summary */}
                  <section>
                    <h3>
                      <Brain size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
                      Performance Summary
                    </h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'hsl(var(--foreground))', opacity: 0.9 }}>
                      {employeeReport.summary}
                    </p>
                  </section>

                  {/* Strengths */}
                  <section>
                    <h3>
                      <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle', color: '#10b981' }} />
                      Strengths
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {employeeReport.strengths?.map((s, i) => (
                        <div key={i} className="insight-card insight-card-strength" style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: '#10b981', marginRight: '0.5rem', fontWeight: 700 }}>✓</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Areas for Improvement */}
                  <section>
                    <h3>
                      <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle', color: '#f59e0b' }} />
                      Areas for Improvement
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {employeeReport.improvements?.map((imp, i) => (
                        <div key={i} className="insight-card insight-card-risk" style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: '#f59e0b', marginRight: '0.5rem', fontWeight: 700 }}>!</span>
                          {imp}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Metric Breakdown */}
                  <section>
                    <h3>
                      <BarChart3 size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
                      Metric Breakdown
                    </h3>
                    <div className="metric-grid">
                      <MetricBar label="Planning" value={employeeReport.planningScore} color="#6366f1" />
                      <MetricBar label="Engagement" value={employeeReport.engagementScore} color="#10b981" />
                      <MetricBar label="Bookings" value={Math.min(10, employeeReport.bookingConsistency * 2)} color="#3b82f6" />
                      <MetricBar label="Stability" value={Math.max(0, 10 - employeeReport.changeRequestFrequency * 3)} color="#8b5cf6" />
                    </div>
                  </section>

                  {/* Trajectory Chart */}
                  <section>
                    <h3>
                      <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
                      Performance Trajectory (12 Weeks)
                    </h3>
                    <div style={{ height: '180px', marginTop: '0.5rem' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={employeeReport.trajectory?.map((s, i) => ({
                          week: employeeReport.trajectoryLabels?.[i] || `W${i+1}`,
                          score: s
                        }))}>
                          <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              background: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: 'var(--radius)',
                              fontSize: '0.8rem'
                            }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                            dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  {/* Trajectory Outlook */}
                  <section>
                    <h3>
                      <Target size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
                      Trajectory Outlook
                    </h3>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'hsl(var(--foreground))', opacity: 0.85 }}>
                      {employeeReport.trajectoryOutlook}
                    </p>
                  </section>

                  {/* Recommended Action */}
                  <section>
                    <h3>
                      <Shield size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle', color: '#6366f1' }} />
                      Recommended Action
                    </h3>
                    <div className="insight-card insight-card-action" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      <Sparkles size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', color: '#6366f1' }} />
                      {employeeReport.recommendedAction}
                    </div>
                  </section>

                  {/* Close Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn-ui btn-primary"
                      onClick={() => { setSelectedEmployee(null); setEmployeeReport(null); }}>
                      Close Report
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
