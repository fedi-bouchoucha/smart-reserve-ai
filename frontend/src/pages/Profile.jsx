import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  Mail, 
  AtSign, 
  Shield, 
  Save, 
  Key,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
    const { user, setUser } = useAuth();
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        username: '',
        profilePicture: ''
    });
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (user) {
            setForm({
                fullName: user.fullName || '',
                email: user.email || '',
                username: user.username || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm({ ...form, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.put('/auth/profile', {
                fullName: form.fullName,
                email: form.email,
                profilePicture: form.profilePicture,
                username: form.username
            });
            const updatedUser = { ...user, fullName: res.data.fullName, email: res.data.email, profilePicture: res.data.profilePicture, username: res.data.username };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (passwords.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);
        try {
            await api.post('/auth/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setShowPasswordModal(false);
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Failed to change password. Is your old password correct?');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="animate-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Account Settings</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Manage your personal information and preferences</p>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1.5rem',
                            background: message.type === 'success' ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--destructive) / 0.1)',
                            color: message.type === 'success' ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                        }}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Avatar & Identity Header */}
            <div className="card-modern" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                    />
                    <div 
                        onClick={() => fileInputRef.current.click()}
                        style={{ 
                            width: '4.5rem', 
                            height: '4.5rem', 
                            borderRadius: '999px', 
                            background: form.profilePicture ? 'transparent' : 'hsl(var(--primary) / 0.1)',
                            color: 'hsl(var(--primary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            flexShrink: 0,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {form.profilePicture ? (
                            <img src={form.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            user?.fullName?.charAt(0)?.toUpperCase()
                        )}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            color: 'white'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                        >
                            <Camera size={24} />
                        </div>
                    </div>
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user?.fullName}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>@{user?.username}</span>
                        <div className="badge-ui badge-indigo">{user?.role}</div>
                        {user?.targetAttendance && (
                            <div className="badge-ui" style={{ background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))' }}>
                                Target: {user.targetAttendance}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="card-modern">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} style={{ color: 'hsl(var(--primary))' }} />
                    <span>Personal Information</span>
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <AtSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="text"
                                className="input-modern"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="text"
                                className="input-modern"
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                required
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="email"
                                className="input-modern"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                style={{ paddingLeft: '38px' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-ui btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Saving…' : (
                            <>
                                <Save size={18} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Security Card */}
            <div className="card-modern" style={{ marginTop: '1.5rem', borderColor: 'hsl(var(--destructive) / 0.2)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={18} style={{ color: 'hsl(var(--destructive))' }} />
                    <span>Security & Privacy</span>
                </h3>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    Keep your account secure by regularly updating your password.
                </p>
                <button className="btn-ui btn-outline" onClick={() => setShowPasswordModal(true)}>
                    <Key size={16} />
                    <span>Change Password</span>
                </button>
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="modal-overlay modal-modern-overlay" onClick={() => setShowPasswordModal(false)}>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-content modal-modern-content" 
                            onClick={e => e.stopPropagation()} 
                            style={{ maxWidth: '400px' }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'hsl(var(--destructive) / 0.1)', color: 'hsl(var(--destructive))', width: '3rem', height: '3rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <Key size={24} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Change Password</h2>
                                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Update your security credentials</p>
                            </div>

                            {passwordError && (
                                <div className="alert alert-error" style={{ marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                                    <AlertCircle size={16} />
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input 
                                        type="password" 
                                        className="input-modern" 
                                        value={passwords.oldPassword}
                                        onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                        required 
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input 
                                        type="password" 
                                        className="input-modern" 
                                        value={passwords.newPassword}
                                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        required 
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '2rem' }}>
                                    <label className="form-label">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        className="input-modern" 
                                        value={passwords.confirmPassword}
                                        onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        required 
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-ui btn-ghost" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-ui btn-primary" disabled={passwordLoading}>
                                        {passwordLoading ? 'Updating…' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
