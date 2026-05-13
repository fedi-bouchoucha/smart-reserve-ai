import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Activity, AlertTriangle, Ban, CheckCircle,
    Clock, MapPin, Monitor, Wifi, ChevronDown, ChevronUp,
    Zap, BarChart3, PieChart
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RPieChart, Pie, Cell,
    Legend
} from 'recharts';
import api from '../services/api';

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
                            <p>No activity logs recorded.</p>
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
