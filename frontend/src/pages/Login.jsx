import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Lock, User, LogIn, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(username, password);
            switch (data.role) {
                case 'ADMIN': navigate('/admin'); break;
                case 'MANAGER': navigate('/manager'); break;
                default: navigate('/employee');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
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
                style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}
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
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                        Enter your credentials to access your workspace
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="badge-ui" 
                        style={{ 
                            background: 'hsl(var(--destructive) / 0.1)', 
                            color: 'hsl(var(--destructive))',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius)',
                            width: '100%',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            fontSize: '0.875rem'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="text"
                                className="input-modern"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g. employee1"
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label">Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', fontWeight: 600 }}>Forgot?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="password"
                                className="input-modern"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px' }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-ui btn-primary" style={{ width: '100%', gap: '0.75rem' }} disabled={loading}>
                        {loading ? 'Authenticating...' : (
                            <>
                                <span>Sign In</span>
                                <LogIn size={18} />
                            </>
                        )}
                    </button>

                    <div style={{ 
                        marginTop: '2rem', 
                        textAlign: 'center', 
                        fontSize: '0.875rem',
                        color: 'hsl(var(--muted-foreground))'
                    }}>
                        Don't have an account? {' '}
                        <Link to="/register" style={{ color: 'hsl(var(--primary))', fontWeight: 600, textDecoration: 'none' }}>
                            Create account
                        </Link>
                    </div>
                </form>

                <div 
                    className="card-modern card-ghost" 
                    style={{ 
                        marginTop: '2.5rem', 
                        padding: '1.25rem',
                        fontSize: '0.8rem',
                        color: 'hsl(var(--muted-foreground))'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'hsl(var(--foreground))' }}>
                        <Info size={16} />
                        <span style={{ fontWeight: 600 }}>Demo Access</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        <div style={{ background: 'hsl(var(--secondary))', padding: '0.5rem', borderRadius: '4px' }}>
                            <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Admin</div>
                            <div>admin</div>
                        </div>
                        <div style={{ background: 'hsl(var(--secondary))', padding: '0.5rem', borderRadius: '4px' }}>
                            <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Manager</div>
                            <div>manager1</div>
                        </div>
                        <div style={{ background: 'hsl(var(--secondary))', padding: '0.5rem', borderRadius: '4px' }}>
                            <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Employee</div>
                            <div>employee1</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
