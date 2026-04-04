import { useState, useEffect } from 'react';
import webSocketService from '../services/websocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function NotificationHub() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        webSocketService.connect((newNotification) => {
            const id = Date.now();
            setNotifications(prev => [...prev, { id, ...newNotification }]);
            
            // Auto-remove after 6 seconds
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 6000);
        });

        return () => webSocketService.disconnect();
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '380px',
            width: '100%'
        }}>
            <AnimatePresence>
                {notifications.map((n) => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className="card-modern"
                        style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '16px',
                            background: 'hsl(var(--card))',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            border: '1px solid hsl(var(--border))',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'hsl(var(--primary) / 0.1)',
                            color: 'hsl(var(--primary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Bell size={20} />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <div style={{ 
                                fontWeight: 700, 
                                fontSize: '0.875rem', 
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span>New Notification</span>
                            </div>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '0.875rem', 
                                color: 'hsl(var(--muted-foreground))',
                                lineHeight: '1.4'
                            }}>
                                {n.message}
                            </p>
                            <span style={{ 
                                fontSize: '0.75rem', 
                                color: 'hsl(var(--muted-foreground) / 0.6)',
                                marginTop: '8px',
                                display: 'block'
                            }}>
                                Just now
                            </span>
                        </div>

                        <button 
                            onClick={() => removeNotification(n.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'hsl(var(--muted-foreground))',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={16} />
                        </button>

                        {/* Animated progress bar for auto-hide */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 6, ease: "linear" }}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                height: '3px',
                                background: 'hsl(var(--primary))'
                            }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
