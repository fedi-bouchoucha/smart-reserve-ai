import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Activity, AlertTriangle, Ban, CheckCircle,
    Eye, Clock, MapPin, Monitor, Wifi, ChevronDown, ChevronUp,
    Zap, Search, FlaskConical, BarChart3, PieChart,
    Globe, Server, UserX, CalendarX, Bot, Sunrise
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RPieChart, Pie, Cell,
    AreaChart, Area, Legend
} from 'recharts';
import api from '../services/api';

// ─── Pre-built Scenarios ─────────────────────────────────────────
const SCENARIOS = [
    {
        name: 'Normal Activity',
        icon: CheckCircle,
        data: {
            userId: 2, username: 'employee1',
            timestamp: new Date().toISOString(),
            loginLocation: 'Tunisia/Tunis', ipAddress: '192.168.1.100',
            deviceType: 'Windows Desktop', requestsLastMinute: 5,
            bookingActions: 1, cancellationActions: 0
        }
    },
    {
        name: 'Location Jump',
        icon: Globe,
        data: {
            userId: 2, username: 'employee1',
            timestamp: new Date().toISOString(),
            loginLocation: 'Russia/Moscow', ipAddress: '185.220.101.42',
            deviceType: 'Linux Desktop', requestsLastMinute: 3,
            bookingActions: 0, cancellationActions: 0
        }
    },
    {
        name: 'Bot Attack',
        icon: Bot,
        data: {
            userId: 3, username: 'employee2',
            timestamp: new Date().toISOString(),
            loginLocation: 'Tunisia/Tunis', ipAddress: '10.0.0.55',
            deviceType: 'API Client (cURL)', requestsLastMinute: 150,
            bookingActions: 45, cancellationActions: 0
        }
    },
    {
        name: 'Booking Abuse',
        icon: CalendarX,
        data: {
            userId: 4, username: 'employee3',
            timestamp: new Date().toISOString(),
            loginLocation: 'Tunisia/Sfax', ipAddress: '192.168.2.50',
            deviceType: 'Windows Desktop', requestsLastMinute: 20,
            bookingActions: 15, cancellationActions: 12
        }
    },
    {
        name: 'Off-Hours Access',
        icon: Sunrise,
        data: {
            userId: 5, username: 'manager1',
            timestamp: new Date(new Date().setHours(3, 30, 0)).toISOString(),
            loginLocation: 'Tunisia/Tunis', ipAddress: '192.168.1.200',
            deviceType: 'Mobile', requestsLastMinute: 2,
            bookingActions: 0, cancellationActions: 0
        }
    },
    {
        name: 'Unknown Device',
        icon: Monitor,
        data: {
            userId: 2, username: 'employee1',
            timestamp: new Date().toISOString(),
            loginLocation: 'Tunisia/Tunis', ipAddress: '45.33.32.156',
            deviceType: 'Unknown', requestsLastMinute: 8,
            bookingActions: 2, cancellationActions: 1
        }
    },
];

// ─── Chart Colors ────────────────────────────────────────────────
const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#dc2626'];
const PIE_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function SecurityMonitor() {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [expandedRow, setExpandedRow] = useState(null);
    const [clock, setClock] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // Simulation state
    const [simForm, setSimForm] = useState(SCENARIOS[0].data);
    const [simResult, setSimResult] = useState(null);
    const [simLoading, setSimLoading] = useState(false);
    const [activeScenario, setActiveScenario] = useState(0);

    // ─── Data Fetching ──────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            const [statsRes, logsRes] = await Promise.all([
                api.get('/admin/security/stats'),
                api.get('/admin/security/logs')
            ]);
            setStats(statsRes.data);
            setLogs(logsRes.data);
        } catch (err) {
            console.error('Security data fetch failed:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000); // Refresh every 15s
        return () => clearInterval(interval);
    }, [fetchData]);

    // Live clock
    useEffect(() => {
        const t = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // ─── Simulation ─────────────────────────────────────────────
    const runSimulation = async () => {
        setSimLoading(true);
        setSimResult(null);
        try {
            const res = await api.post('/admin/security/simulate', simForm);
            setSimResult(res.data);
        } catch (err) {
            setSimResult({ status: 'ERROR', risk_score: -1, reason: 'Simulation failed: ' + (err.response?.data?.error || err.message), recommended_action: 'N/A' });
        } finally {
            setSimLoading(false);
        }
    };

    const analyzeAndSave = async () => {
        setSimLoading(true);
        try {
            await api.post('/admin/security/analyze', simForm);
            await fetchData();
            setSimResult({ status: 'SAVED', risk_score: 0, reason: 'Activity logged and analyzed successfully. Check the activity feed below.', recommended_action: 'allow' });
        } catch (err) {
            setSimResult({ status: 'ERROR', risk_score: -1, reason: 'Failed: ' + (err.response?.data?.error || err.message), recommended_action: 'N/A' });
        } finally {
            setSimLoading(false);
        }
    };

    const selectScenario = (idx) => {
        setActiveScenario(idx);
        setSimForm({ ...SCENARIOS[idx].data, timestamp: new Date().toISOString() });
        setSimResult(null);
    };

    // ─── Helpers ─────────────────────────────────────────────────
    const getRiskClass = (score) => {
        if (score <= 20) return 'risk-low';
        if (score <= 50) return 'risk-medium';
        if (score <= 80) return 'risk-high';
        return 'risk-critical';
    };

    const getRowClass = (action) => {
        if (action === 'allow') return 'threat-row-normal';
        if (action === 'require_verification') return 'threat-row-verification';
        if (action === 'alert_admin') return 'threat-row-alert';
        if (action === 'block') return 'threat-row-block';
        return '';
    };

    const formatTime = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts);
        return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const filteredLogs = filter === 'all' ? logs :
        filter === 'anomalous' ? logs.filter(l => l.status === 'ANOMALOUS') :
            logs.filter(l => l.recommendedAction === filter);

    // ─── Chart Data ─────────────────────────────────────────────
    const riskDistribution = (() => {
        const buckets = { 'Safe (0-20)': 0, 'Warning (21-50)': 0, 'High (51-80)': 0, 'Critical (81-100)': 0 };
        logs.forEach(l => {
            if (l.riskScore <= 20) buckets['Safe (0-20)']++;
            else if (l.riskScore <= 50) buckets['Warning (21-50)']++;
            else if (l.riskScore <= 80) buckets['High (51-80)']++;
            else buckets['Critical (81-100)']++;
        });
        return Object.entries(buckets).map(([name, value]) => ({ name, value }));
    })();

    const actionBreakdown = (() => {
        const counts = { allow: 0, require_verification: 0, alert_admin: 0, block: 0 };
        logs.forEach(l => { if (counts[l.recommendedAction] !== undefined) counts[l.recommendedAction]++; });
        return Object.entries(counts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
    })();

    const threatLevel = stats ? (stats.totalEvents > 0 ? Math.round((stats.totalAnomalies / Math.max(stats.totalEvents, 1)) * 100) : 0) : 0;
    const threatClass = threatLevel < 20 ? 'threat-level-safe' : threatLevel < 50 ? 'threat-level-warning' : 'threat-level-critical';

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div className="spinner" /><span style={{ marginLeft: '1rem' }}>Initializing Security Monitor...</span>
            </div>
        );
    }

    return (
        <motion.div
            className="security-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* ─── Header ────────────────────────────────────────── */}
            <div className="security-header">
                <div className="security-title">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        style={{
                            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                            padding: '0.625rem',
                            borderRadius: '0.75rem',
                            color: 'white',
                            display: 'flex'
                        }}
                    >
                        <Shield size={28} />
                    </motion.div>
                    <div>
                        <h1>Security Monitor</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                            <span className={`pulse-dot ${threatLevel > 40 ? 'danger' : ''}`} />
                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                Anomaly Detection Engine Active
                            </span>
                        </div>
                    </div>
                </div>
                <div className="security-clock">
                    <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '0.375rem' }} />
                    {clock.toLocaleTimeString('en-GB')} — {clock.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
            </div>

            {/* ─── Stats Grid ────────────────────────────────────── */}
            <div className="security-stats-grid">
                {[
                    { label: 'Total Events', value: stats?.totalEvents || 0, cls: 'stat-cyan', icon: Activity },
                    { label: 'Anomalies', value: stats?.totalAnomalies || 0, cls: 'stat-red', icon: AlertTriangle },
                    { label: 'Blocked', value: stats?.blockedActions || 0, cls: 'stat-amber', icon: Ban },
                    { label: 'Events (24h)', value: stats?.events24h || 0, cls: 'stat-purple', icon: Zap },
                    { label: 'Normal', value: stats?.totalNormal || 0, cls: 'stat-emerald', icon: CheckCircle },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        className={`security-stat-card ${s.cls}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                            <s.icon size={20} style={{ opacity: 0.4 }} />
                        </div>
                        {s.label === 'Anomalies' && (
                            <div className="threat-level-bar">
                                <div className={`threat-level-fill ${threatClass}`} style={{ width: `${Math.min(threatLevel, 100)}%` }} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* ─── Charts ────────────────────────────────────────── */}
            <div className="security-charts-grid">
                <motion.div
                    className="security-chart-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3><BarChart3 size={16} /> Risk Score Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={riskDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    background: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem'
                                }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {riskDistribution.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    className="security-chart-card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3><PieChart size={16} /> Action Breakdown</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <RPieChart>
                            <Pie
                                data={actionBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {actionBreakdown.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem'
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        </RPieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* ─── Simulation Panel ─────────────────────────────── */}
            <motion.div
                className="simulation-panel scan-line-overlay"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3><FlaskConical size={18} /> Threat Simulation Engine</h3>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
                    Select a pre-built scenario or customize the parameters to test the anomaly detection engine.
                </p>

                <div className="scenario-buttons">
                    {SCENARIOS.map((sc, i) => (
                        <button
                            key={i}
                            className={`scenario-btn ${activeScenario === i ? 'active' : ''}`}
                            onClick={() => selectScenario(i)}
                        >
                            <sc.icon size={14} />
                            {sc.name}
                        </button>
                    ))}
                </div>

                <div className="simulation-grid">
                    <div className="form-group">
                        <label className="form-label">User ID</label>
                        <input className="input-modern" type="number" value={simForm.userId || ''}
                            onChange={e => setSimForm({ ...simForm, userId: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input className="input-modern" value={simForm.username || ''}
                            onChange={e => setSimForm({ ...simForm, username: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location (Country/City)</label>
                        <input className="input-modern" value={simForm.loginLocation || ''}
                            onChange={e => setSimForm({ ...simForm, loginLocation: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">IP Address</label>
                        <input className="input-modern" value={simForm.ipAddress || ''}
                            onChange={e => setSimForm({ ...simForm, ipAddress: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Device Type</label>
                        <input className="input-modern" value={simForm.deviceType || ''}
                            onChange={e => setSimForm({ ...simForm, deviceType: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Requests / Minute</label>
                        <input className="input-modern" type="number" value={simForm.requestsLastMinute || 0}
                            onChange={e => setSimForm({ ...simForm, requestsLastMinute: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Booking Actions</label>
                        <input className="input-modern" type="number" value={simForm.bookingActions || 0}
                            onChange={e => setSimForm({ ...simForm, bookingActions: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Cancellation Actions</label>
                        <input className="input-modern" type="number" value={simForm.cancellationActions || 0}
                            onChange={e => setSimForm({ ...simForm, cancellationActions: parseInt(e.target.value) || 0 })} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button className="btn-ui btn-primary" onClick={runSimulation} disabled={simLoading}>
                        <Search size={16} />
                        {simLoading ? 'Analyzing…' : 'Simulate (Dry Run)'}
                    </button>
                    <button className="btn-ui btn-outline" onClick={analyzeAndSave} disabled={simLoading}>
                        <Activity size={16} />
                        Analyze & Save
                    </button>
                </div>

                <AnimatePresence>
                    {simResult && (
                        <motion.div
                            className={`simulation-result ${simResult.status === 'ANOMALOUS' ? 'result-anomalous' : 'result-normal'}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {JSON.stringify(simResult, null, 2)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ─── Activity Feed ──────────────────────────────────── */}
            <motion.div
                className="security-table-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="security-table-header">
                    <h3>
                        <Activity size={16} />
                        Live Activity Feed
                        <span className="pulse-dot" style={{ marginLeft: '0.5rem' }} />
                    </h3>
                    <div className="security-filters">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'anomalous', label: 'Anomalous' },
                            { key: 'block', label: 'Blocked' },
                            { key: 'alert_admin', label: 'Alerts' },
                        ].map(f => (
                            <button
                                key={f.key}
                                className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                                onClick={() => setFilter(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="security-table-scroll">
                    {filteredLogs.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                            <Shield size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No activity logs yet. Use the simulation panel above to generate test data.</p>
                        </div>
                    ) : (
                        <table className="table-ui" style={{ minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>User</th>
                                    <th>Location</th>
                                    <th>IP</th>
                                    <th>Device</th>
                                    <th>Risk</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <AnimatePresence key={log.id}>
                                        <motion.tr
                                            className={getRowClass(log.recommendedAction)}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                        >
                                            <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                <Clock size={12} style={{ marginRight: '0.25rem', opacity: 0.5 }} />
                                                {formatTime(log.timestamp)}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{log.username}</td>
                                            <td>
                                                <MapPin size={12} style={{ marginRight: '0.25rem', opacity: 0.5 }} />
                                                {log.loginLocation || '—'}
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                <Wifi size={12} style={{ marginRight: '0.25rem', opacity: 0.5 }} />
                                                {log.ipAddress || '—'}
                                            </td>
                                            <td>
                                                <Monitor size={12} style={{ marginRight: '0.25rem', opacity: 0.5 }} />
                                                {log.deviceType || '—'}
                                            </td>
                                            <td>
                                                <span className={`risk-badge ${getRiskClass(log.riskScore)}`}>
                                                    {log.riskScore}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge-ui ${log.status === 'ANOMALOUS' ? 'badge-warning' : 'badge-success'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`action-badge action-${log.recommendedAction}`}>
                                                    {log.recommendedAction?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                {expandedRow === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </td>
                                        </motion.tr>
                                        {expandedRow === log.id && (
                                            <tr className="log-detail-row">
                                                <td colSpan={9}>
                                                    <div className="log-detail-content">
                                                        <div className="detail-item">
                                                            <span className="detail-label">Reason</span>
                                                            <span>{log.reason}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="detail-label">Req/min</span>
                                                            <span>{log.requestsLastMinute}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="detail-label">Bookings</span>
                                                            <span>{log.bookingActions}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="detail-label">Cancellations</span>
                                                            <span>{log.cancellationActions}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
