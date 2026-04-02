import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
    const { user, setUser } = useAuth();
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        username: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setForm({
                fullName: user.fullName || '',
                email: user.email || '',
                username: user.username || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.put('/auth/profile', {
                fullName: form.fullName,
                email: form.email
            });
            // Update context
            const updatedUser = { ...user, fullName: res.data.fullName, email: res.data.email };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Update stored data
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Account Profile</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information and preferences</p>
            </div>

            {message.text && <div className={`alert alert-${message.type}`} style={{ marginBottom: '24px' }}>{message.text}</div>}

            <div className="card" style={{ padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Username (Read-only)</label>
                        <input
                            type="text"
                            value={form.username}
                            disabled
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Full Name</label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            required
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Email Address</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ padding: '12px 32px', fontSize: '1rem', fontWeight: '700', borderRadius: 'var(--radius-sm)' }}
                    >
                        {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            <div className="card" style={{ marginTop: '24px', padding: '24px', background: 'rgba(var(--danger-rgb), 0.05)', border: '1px solid var(--danger)' }}>
                <h4 style={{ color: 'var(--danger)', marginBottom: '8px' }}>Privacy & Security</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Need to change your password or delete your account? Contact your administrator.</p>
                <button className="btn btn-secondary btn-sm" disabled>Request Password Reset</button>
            </div>
        </div>
    );
}
