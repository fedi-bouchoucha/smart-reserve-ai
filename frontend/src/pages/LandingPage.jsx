import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar, Users, MapPin, BarChart3,
    ArrowRight, CheckCircle2, Shield, Zap,
    Building2, Briefcase, Coffee, Globe,
    HelpCircle, Clock, Info, Target as TargetIcon
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <img
                            src="/logo.jpg"
                            alt="Dräxlmaier Logo"
                            style={{
                                height: '100px',
                                width: 'auto',
                                filter: 'brightness(1.1)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        <div style={{
                            fontSize: '1.75rem',
                            fontWeight: 900,
                            letterSpacing: '-0.03em',
                            color: 'hsl(var(--foreground))',
                            background: 'linear-gradient(to right, hsl(var(--foreground)), hsl(var(--foreground) / 0.7))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem'
                        }}>
                            <span style={{ height: '40px', width: '2px', background: 'hsl(var(--border))', margin: '0 0.8rem' }} />
                            SmartReserve
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/login" className="btn-ui btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem' }}>
                            Log In
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
                        <Link to="/login" className="btn-ui btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Get Started <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </motion.div>
                {/* How It Works Section (Tutorials) */}
                <section id="how-it-works" style={{ padding: '8rem 2rem', background: 'hsl(var(--secondary) / 0.15)', borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                <HelpCircle size={16} /> <span>Get Started Quickly</span>
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>How it Works for Employees</h2>
                            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                                Master the platform in minutes with our simple 4-step workflow designed for agile teams.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem', marginBottom: '5rem' }}>
                            {/* Step 1 */}
                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'hsl(var(--primary) / 0.1)', marginBottom: '-1.5rem', marginLeft: '-0.5rem' }}>01</div>
                                <div style={{ position: 'relative', zIndex: 1, padding: '2rem', background: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <MapPin size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Select your Spot</h3>
                                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.925rem', lineHeight: 1.6 }}>
                                        Click any future date on the calendar. Browse available desks or meeting rooms and pick the one that fits your needs.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Step 2 */}
                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.1 }}>
                                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'hsl(var(--success) / 0.1)', marginBottom: '-1.5rem', marginLeft: '-0.5rem' }}>02</div>
                                <div style={{ position: 'relative', zIndex: 1, padding: '2rem', background: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--success))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <Coffee size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Mark your Days Off</h3>
                                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.925rem', lineHeight: 1.6 }}>
                                        Toggle to "Days Off" mode to plan your remote working days. The system automatically tracks your presence goals.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Step 3 */}
                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}>
                                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'hsl(var(--warning) / 0.1)', marginBottom: '-1.5rem', marginLeft: '-0.5rem' }}>03</div>
                                <div style={{ position: 'relative', zIndex: 1, padding: '2rem', background: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--warning))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <Clock size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Flexible Changes</h3>
                                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.925rem', lineHeight: 1.6 }}>
                                        Plans changed? Use the "Change Request" tool. Your manager will review and approve your request in real-time.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Step 4 */}
                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.3 }}>
                                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'hsl(var(--primary) / 0.1)', marginBottom: '-1.5rem', marginLeft: '-0.5rem' }}>04</div>
                                <div style={{ position: 'relative', zIndex: 1, padding: '2rem', background: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <Zap size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Stay Connected</h3>
                                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.925rem', lineHeight: 1.6 }}>
                                        Receive instant alerts when your team is in the office or when your requests are updated.
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Rules Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            style={{
                                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--success) / 0.05))',
                                padding: '3rem',
                                borderRadius: '1.5rem',
                                border: '1px solid hsl(var(--primary) / 0.2)',
                                display: 'flex',
                                gap: '3rem',
                                alignItems: 'center',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Shield style={{ color: 'hsl(var(--primary))' }} /> Smart Office Compliance
                                </h3>
                                <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', lineHeight: 1.6 }}>
                                    Our platform helps you stay aligned with company culture. Keep these two core policies in mind while planning:
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ color: 'hsl(var(--primary))', marginTop: '0.25rem' }}><Clock size={20} /></div>
                                        <div>
                                            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Booking Window</div>
                                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                                                Reserve between the <strong>1st & 20th</strong> for the next month. Standard self-service window.
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ color: 'hsl(var(--success))', marginTop: '0.25rem' }}><TargetIcon size={20} /></div>
                                        <div>
                                            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Collaborative Presence</div>
                                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                                                Maintain at least <strong>50% office presence</strong> monthly to foster team synergy and innovation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                width: '240px',
                                margin: '0 auto',
                                background: 'hsl(var(--card))',
                                borderRadius: '1.25rem',
                                padding: '2rem',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <TargetIcon size={32} />
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(var(--primary))', marginBottom: '0.25rem' }}>50%</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em' }}>Minimum Presence</div>
                                <div style={{ width: '100%', height: '8px', background: 'hsl(var(--secondary))', borderRadius: '4px', marginTop: '1.5rem', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '50%' }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        style={{ height: '100%', background: 'hsl(var(--primary))' }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

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
                            <TargetIcon size={24} />
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
                                Designed for security <br /> and scale.
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
                <Link to="/login" className="btn-ui btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-flex' }}>
                    Log into your dashboard
                </Link>
            </section>

            <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                © 2026 SmartReserve Technologies. All rights reserved.
            </footer>
        </div>
    );
}
