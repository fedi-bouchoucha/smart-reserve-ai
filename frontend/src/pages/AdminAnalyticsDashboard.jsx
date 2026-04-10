import { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area
} from 'recharts';
import api from '../services/api';
import { DownloadCloud, Activity, TrendingUp, Users } from 'lucide-react';

export default function AdminAnalyticsDashboard() {
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [dailyPresence, setDailyPresence] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [ovRes, trRes, dpRes] = await Promise.all([
                    api.get('/admin/analytics/overview'),
                    api.get('/admin/analytics/usage-trends'),
                    api.get('/admin/analytics/daily-presence')
                ]);
                setOverview(ovRes.data);
                setTrends(trRes.data);
                setDailyPresence(dpRes.data);
            } catch (e) {
                console.error("Failed to fetch analytics", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'hsl(var(--muted-foreground))' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid hsl(var(--border))', borderTopColor: 'hsl(var(--primary))', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <div>Analyzing office utilization patterns...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Intelligent Analytics</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))' }}>Advanced office utilization and behavioral insights</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                        type="month"
                        className="input-modern"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                    />
                    <button 
                        className="btn-ui btn-outline"
                        onClick={async () => {
                            try {
                                const response = await api.get(`/admin/analytics/download-report?month=${selectedMonth}`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `office_usage_report_${selectedMonth}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (e) {
                                alert('Failed to download report');
                            }
                        }}
                    >
                        <DownloadCloud size={18} style={{ marginRight: '0.5rem' }}/>
                        <span>Download Report</span>
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card-modern" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'hsl(var(--primary) / 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'hsl(var(--primary))' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>{overview?.utilizationRate}%</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 600 }}>Avg. Utilization Rate</div>
                    </div>
                </div>
                
                <div className="card-modern" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'hsl(var(--success) / 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'hsl(var(--success))' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{overview?.totalReservations}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 600 }}>Total Bookings</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card-modern" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Usage Trends</h3>
                    </div>
                    <div style={{ height: 350, padding: '1.5rem 1.5rem 0.5rem 0' }}>
                        <ResponsiveContainer>
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card-modern" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Daily Employee Presence (%)</h3>
                    </div>
                    <div style={{ height: 350, padding: '1.5rem 1.5rem 0.5rem 0' }}>
                        <ResponsiveContainer>
                            <AreaChart data={dailyPresence}>
                                <defs>
                                    <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 600 }}
                                    formatter={(value) => [`${value}%`, 'Presence']}
                                />
                                <Area type="monotone" dataKey="percentage" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorPercentage)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
