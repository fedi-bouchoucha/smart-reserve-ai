import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Calendar, Users, MapPin, BarChart3, 
    ArrowRight, CheckCircle2, Shield, Zap,
    Building2, Briefcase, Coffee, Globe
} from 'lucide-react';

// Animation variants
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', overflowX: 'hidden' }}>
            
            {/* Header / Navbar */}
            <header style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, 
                background: 'hsl(var(--background) / 0.8)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid hsl(var(--border))'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem' }}>
                        <div style={{ background: 'hsl(var(--primary))', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <Calendar size={20} />
                        </div>
                        SmartReserve
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '0.9rem' }}>
                            Log In
                        </Link>
                        <Link to="/register" className="btn-ui btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem' }}>
                            Sign Up
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{ 
                padding: '10rem 2rem 6rem', 
                textAlign: 'center', 
                maxWidth: '1000px', 
                margin: '0 auto',
                position: 'relative'
            }}>
                {/* Background glow effects */}
                <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'hsl(var(--primary))', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '30%', right: '10%', width: '350px', height: '350px', background: 'transparent', boxShadow: '0 0 150px hsl(var(--success))', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }} />

                <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ position: 'relative', zIndex: 10 }}>
                    <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
                        <Zap size={16} /> <span>Smart Office Management v2.0 is live</span>
                    </motion.div>
                    
                    <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                        Book your workspace.<br />
                        <span style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--success)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Collaborate effortlessly.
                        </span>
                    </motion.h1>
                    
                    <motion.p variants={fadeUp} style={{ fontSize: '1.25rem', color: 'hsl(var(--muted-foreground))', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                        The intelligent platform for managing hybrid office presence, scheduling meeting rooms, and synchronizing your team's weekly flow.
                    </motion.p>
                    
                    <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn-ui btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Get Started Free <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="btn-ui btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>
                            Book a Demo
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Dashboard Mockup Visual */}
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 50 }}
                    style={{ 
                        marginTop: '5rem',
                        borderRadius: '0.75rem',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 10
                    }}
                >
                    <div style={{ background: 'hsl(var(--secondary))', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'hsl(var(--destructive))' }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'hsl(var(--warning))' }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'hsl(var(--success))' }} />
                    </div>
                    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ height: '8px', width: '40%', background: 'hsl(var(--muted))', borderRadius: '4px' }} />
                            <div style={{ height: '40px', width: '100%', background: 'hsl(var(--primary) / 0.1)', borderRadius: '8px', border: '1px solid hsl(var(--primary))' }} />
                            <div style={{ height: '40px', width: '100%', background: 'hsl(var(--muted))', borderRadius: '8px' }} />
                            <div style={{ height: '40px', width: '100%', background: 'hsl(var(--muted))', borderRadius: '8px' }} />
                        </div>
                        <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ height: '16px', width: '120px', background: 'hsl(var(--primary))', borderRadius: '4px' }} />
                                <div style={{ height: '16px', width: '80px', background: 'hsl(var(--success))', borderRadius: '4px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} style={{ height: '60px', borderRadius: '8px', background: i === 2 || i === 3 ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--secondary))', border: i === 2 || i === 3 ? '1px solid hsl(var(--primary))' : 'none' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Trust Indicators */}
            <section style={{ padding: '2rem', textAlign: 'center', background: 'hsl(var(--secondary) / 0.3)', borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))' }}>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Trusted by forward-thinking companies</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(2rem, 5vw, 4rem)', flexWrap: 'wrap', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem' }}><Building2 /> TechCorp</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem' }}><Globe /> GlobalNet</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem' }}><Briefcase /> InnovateLtd</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem' }}><Coffee /> StudioX</div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Everything you need for hybrid work</h2>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        SmartReserve bridges the gap between remote freedom and office collaboration.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* Feature 1 */}
                    <div className="card-modern" style={{ padding: '2rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Calendar size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Visual Scheduling</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                            A beautiful FullCalendar interface lets you book desks or meeting rooms with simple clicks. See when your team is in the office.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="card-modern" style={{ padding: '2rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <MapPin size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Resource Selection</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                            Choose precisely where you want to work. Filter available standard desks by floor, or reserve fully-equipped meeting rooms.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="card-modern" style={{ padding: '2rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Target size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Smart Compliance</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                            Automatically enforces company policies (like 2-3 mandatory office days per week). Managers can easily review exception requests.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="card-modern" style={{ padding: '2rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'hsl(var(--info) / 0.1)', color: 'hsl(var(--info))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <BarChart3 size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Actionable Analytics</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                            Administrators get comprehensive dashboards showing utilization rates, peak hours, and downloadable PDF reports.
                        </p>
                    </div>
                </div>
            </section>

            {/* Benefits & Social Proof */}
            <section style={{ background: 'hsl(var(--primary) / 0.03)', padding: '6rem 2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    <div style={{ display: 'none' }} className="responsive-flex">
                         {/* Placeholder for responsive layout if needed. Using inline styles for simplicity here. */}
                    </div>
                    {/* Inline media query style replacement via flex-wrap in actual css, but for simplicity we rely on grid layout */}
                    <style>{`
                        @media (max-width: 768px) {
                            .split-section { grid-template-columns: 1fr !important; gap: 2rem !important; }
                        }
                    `}</style>
                    <div className="split-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', width: '100%' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>
                                Designed for security <br/> and scale.
                            </h2>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    'Role-based access (Employee, Manager, Admin)',
                                    'Secure Java Spring Boot Backend',
                                    'Optimized PostgreSQL Database',
                                    'Framer Motion UI Animations'
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                                        <CheckCircle2 color="hsl(var(--success))" size={20} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ background: 'hsl(var(--card))', padding: '2rem', borderRadius: '1rem', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>AM</div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Alice Martin</div>
                                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Engineering Manager</div>
                                </div>
                            </div>
                            <p style={{ fontStyle: 'italic', color: 'hsl(var(--foreground))', lineHeight: 1.6 }}>"SmartReserve completely eliminated the chaos of our return-to-office strategy. The intuitive calendar means my team always knows who is coming in, and the weekly sync features are a lifesaver."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Ready to optimize your workspace?</h2>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.1rem', marginBottom: '2.5rem' }}>Join thousands of employees booking desks effortlessly.</p>
                <Link to="/register" className="btn-ui btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-flex' }}>
                    Create your account setup
                </Link>
            </section>

            <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                © 2026 SmartReserve Technologies. All rights reserved.
            </footer>
        </div>
    );
}

// target icon mockup component for feature 3
function Target({size, color}) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
}
