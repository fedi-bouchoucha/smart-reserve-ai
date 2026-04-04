import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { LayoutDashboard, User, Mail, AtSign, Lock, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        password: '',
        fullName: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', { ...form, role: 'EMPLOYEE' });
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'hsl(var(--secondary) / 0.3)',
            padding: '1.5rem'
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card-modern" 
                style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ 
                        background: 'hsl(var(--primary))', 
                        padding: '1rem', 
                        borderRadius: '1rem',
                        color: 'white',
                        width: 'fit-content',
                        margin: '0 auto 1.5rem'
                    }}>
                        <LayoutDashboard size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                        Join SmartPlanning to manage your workspace
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        style={{ 
                            background: 'hsl(var(--destructive) / 0.1)', 
                            color: 'hsl(var(--destructive))',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius)',
                            width: '100%',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                                <input
                                    type="text"
                                    name="fullName"
                                    className="input-modern"
                                    placeholder="John Doe"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                    style={{ paddingLeft: '38px' }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div style={{ position: 'relative' }}>
                                <AtSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                                <input
                                    type="text"
                                    name="username"
                                    className="input-modern"
                                    placeholder="johndoe"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                    style={{ paddingLeft: '38px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="email"
                                name="email"
                                className="input-modern"
                                placeholder="john@company.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="password"
                                name="password"
                                className="input-modern"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-ui btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating Account…' : (
                            <>
                                <UserPlus size={18} />
                                <span>Get Started</span>
                            </>
                        )}
                    </button>

                    <div style={{ 
                        marginTop: '2rem', 
                        textAlign: 'center', 
                        fontSize: '0.875rem',
                        color: 'hsl(var(--muted-foreground))'
                    }}>
                        Already have an account? {' '}
                        <Link to="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 600, textDecoration: 'none' }}>
                            Sign In
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
