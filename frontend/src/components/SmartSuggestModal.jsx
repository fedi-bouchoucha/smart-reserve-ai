import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, ArrowRight, Loader2, Star, Zap } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SmartSuggestModal({ isOpen, onClose, selectedDate, availableDesks, onBook }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      generateRecommendations();
    } else {
      setRecommendations([]);
      setError(null);
    }
  }, [isOpen]);

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map frontend desk data to the expected AI schema
      const realTimeAvailability = availableDesks.map((d) => ({
        id: d.id,
        zone: parseInt(d.id) > 20 ? 'Quiet' : 'Collaborative',
        floor: 'Floor 3',
        capacity: 1,
        equipment: ['Monitor', 'Ergonomic Chair'],
        proximityToTeam: Math.random() > 0.5 // Mock proximity for demo
      }));

      const payload = {
        userId: user?.id || 'unknown_user',
        userPreferences: {
          preferredZone: 'Quiet',
          preferredFloor: 'Floor 3',
          equipmentNeeds: ['Monitor']
        },
        historicalBehavior: {
          frequentlyBookedDesks: ['38', '37', '21'],
          teamMembers: ['sarah', 'john']
        },
        currentRequest: {
          date: selectedDate,
          timeSlot: '09:00-17:00',
          type: 'desk',
          numberOfPeople: 1
        },
        realTimeAvailability
      };

      const res = await api.post('/recommendations/generate', payload);
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error('AI Suggestion error:', err);
      setError('Failed to generate recommendations. The AI might be taking a nap.');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'hsl(var(--background) / 0.8)', backdropFilter: 'blur(8px)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="card-modern"
        style={{
          width: '90%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto',
          background: 'linear-gradient(to bottom, hsl(var(--card)), hsl(var(--background)))',
          border: '1px solid hsl(var(--primary) / 0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 40px hsl(var(--primary) / 0.1)'
        }}
      >
        <div style={{
          padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'hsl(var(--primary) / 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px', background: 'hsl(var(--primary) / 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, hsl(var(--primary)), #8b5cf6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                AI Smart Suggest
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Powered by Heuristic Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ui btn-ghost" style={{ padding: '0.5rem' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ color: 'hsl(var(--primary))' }}>
                <Loader2 size={40} />
              </motion.div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>Analyzing preferences & availability...</div>
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Finding the perfect workspace for your flow state</div>
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--destructive))' }}>
              {error}
            </div>
          ) : recommendations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
              No recommendations could be generated.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.resourceId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  style={{
                    padding: '1.25rem', borderRadius: '12px',
                    border: index === 0 ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
                    background: index === 0 ? 'hsl(var(--primary) / 0.05)' : 'hsl(var(--card))',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {index === 0 && (
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.25rem 0.75rem', background: 'hsl(var(--primary))', color: '#fff', fontSize: '0.7rem', fontWeight: 800, borderBottomLeftRadius: '8px' }}>
                      TOP MATCH
                    </div>
                  )}
                  
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                    background: index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                    color: index === 0 ? '#fff' : 'hsl(var(--foreground))',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>{rec.score}</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>Score</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Desk {rec.resourceId}</h3>
                      <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', background: 'hsl(var(--muted))', borderRadius: '10px', color: 'hsl(var(--muted-foreground))' }}>
                        {rec.type}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                      {rec.reason}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => onBook(rec.resourceId)}
                        className="btn-ui btn-primary btn-sm" 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem' }}
                      >
                        <Check size={14} /> Book This Desk
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
