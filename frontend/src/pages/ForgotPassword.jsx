import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Lock, User, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ShieldCheck, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Request, 2: Verify, 3: Reset
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await axios.post('/api/auth/forgot-password/request', { email });
            setStatus({ type: 'success', message: 'Verification code sent to your email.' });
            setStep(2);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.error || 'Account with this email not found.' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await axios.post('/api/auth/forgot-password/verify', { email, code });
            setStatus({ type: 'success', message: 'Code verified! You can now reset your password.' });
            setStep(3);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.error || 'Invalid or expired code.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match.' });
            return;
        }
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await axios.post('/api/auth/reset-password', { email, newPassword, code });
            setStatus({ type: 'success', message: 'Password reset successfully! Redirecting...' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to reset password.' });
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                    >
                        <form onSubmit={handleRequestCode}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                                    <input
                                        type="email"
                                        className="input-modern"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        style={{ paddingLeft: '40px' }}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-ui btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                        </form>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        key="step2"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                    >
                        <form onSubmit={handleVerifyCode}>
                            <div className="form-group">
                                <label className="form-label">Verification Code</label>
                                <div style={{ position: 'relative' }}>
                                    <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                                    <input
                                        type="text"
                                        className="input-modern"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="6-digit code"
                                        maxLength="6"
                                        style={{ paddingLeft: '40px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                                        required
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem', textAlign: 'center' }}>
                                    Check your email ({email}) for the code
                                </p>
                            </div>
                            <button type="submit" className="btn-ui btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="btn-ui btn-ghost" style={{ width: '100%', marginTop: '1rem' }}>
                                Resend Code
                            </button>
                        </form>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        key="step3"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                    >
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                                    <input
                                        type="password"
                                        className="input-modern"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ paddingLeft: '40px' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="form-label">Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                                    <input
                                        type="password"
                                        className="input-modern"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ paddingLeft: '40px' }}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-ui btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Resetting...' : 'Change Password'}
                            </button>
                        </form>
                    </motion.div>
                );
            default: return null;
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="card-modern" 
                style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        background: 'hsl(var(--primary))', 
                        padding: '1rem', 
                        borderRadius: '1rem',
                        color: 'white',
                        width: 'fit-content',
                        margin: '0 auto 1.5rem'
                    }}>
                        {step === 1 && <Mail size={32} />}
                        {step === 2 && <ShieldCheck size={32} />}
                        {step === 3 && <Lock size={32} />}
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                        {step === 1 && "Forgot Password"}
                        {step === 2 && "Verification"}
                        {step === 3 && "New Password"}
                    </h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                        {step === 1 && "Enter your email to receive a security code"}
                        {step === 2 && "Enter the 6-digit code sent to your email"}
                        {step === 3 && "Access secured. Choose your new password"}
                    </p>
                </div>

                {/* Stepper indicator */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', justifyContent: 'center' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{ 
                            height: '4px', 
                            width: '40px', 
                            borderRadius: '2px', 
                            background: s <= step ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                            transition: 'background 0.3s ease'
                        }} />
                    ))}
                </div>

                {status.message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className={`alert alert-${status.type === 'success' ? 'success' : 'error'}`}
                        style={{ marginBottom: '1.5rem' }}
                    >
                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span style={{ fontSize: '0.8rem' }}>{status.message}</span>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>
                
                {step === 1 && (
                    <Link to="/login" className="btn-ui btn-ghost" style={{ width: '100%', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <ArrowLeft size={18} />
                        Back to Sign In
                    </Link>
                )}
            </motion.div>
        </div>
    );
}
