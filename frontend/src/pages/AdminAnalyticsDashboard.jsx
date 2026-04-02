import { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area
} from 'recharts';
import api from '../services/api';

export default function AdminAnalyticsDashboard() {
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [peakHours, setPeakHours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [ovRes, trRes, phRes] = await Promise.all([
                    api.get('/admin/analytics/overview'),
                    api.get('/admin/analytics/usage-trends'),
                    api.get('/admin/analytics/peak-hours')
                ]);
                setOverview(ovRes.data);
                setTrends(trRes.data);
                setPeakHours(phRes.data);
            } catch (e) {
                console.error("Failed to fetch analytics", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="loading">Analyzing patterns...</div>;

    return (
        <div className="analytics-dashboard">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Intelligent Analytics</h1>
                    <p>Advanced office utilization and behavioral insights</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={async () => {
                        try {
                            const response = await api.get('/admin/analytics/download-report', { responseType: 'blob' });
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'office_usage_report.pdf');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        } catch (e) {
                            alert('Failed to download report');
                        }
                    }}
                >
                    📥 Download Full Report (PDF)
                </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{overview?.utilizationRate}%</div>
                    <div className="stat-label">Avg. Utilization</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{overview?.totalReservations}</div>
                    <div className="stat-label">Total Bookings</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card">
                    <div className="card-header"><h3>📈 Trends</h3></div>
                    <div style={{ height: 300, padding: '20px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={trends}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3>🕒 Peak Hours</h3></div>
                    <div style={{ height: 300, padding: '20px' }}>
                        <ResponsiveContainer>
                            <BarChart data={peakHours}>
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="bookings" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
