'use client';
import { useRouter } from 'next/navigation';

/* ─── SVG Icon Components (professional, no emojis) ─── */
const Icon = ({ children, size = 24, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);

const icons = {
  // Objectives
  crosshair: (s = 40) => <Icon size={s} color="#3b82f6"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></Icon>,
  barChart: (s = 40) => <Icon size={s} color="#6366f1"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Icon>,
  award: (s = 40) => <Icon size={s} color="#f59e0b"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></Icon>,
  trendUp: (s = 40) => <Icon size={s} color="#22c55e"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Icon>,

  // Categories
  shield: (s = 32) => <Icon size={s} color="#3b82f6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>,
  flame: (s = 32) => <Icon size={s} color="#f97316"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></Icon>,
  search: (s = 32) => <Icon size={s} color="#06b6d4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>,
  lock: (s = 32) => <Icon size={s} color="#8b5cf6"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>,
  cloud: (s = 32) => <Icon size={s} color="#64748b"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></Icon>,
  mail: (s = 32) => <Icon size={s} color="#ec4899"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Icon>,
  globe: (s = 32) => <Icon size={s} color="#14b8a6"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>,
  cpu: (s = 32) => <Icon size={s} color="#f59e0b"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></Icon>,
  smartphone: (s = 32) => <Icon size={s} color="#a855f7"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></Icon>,
  key: (s = 32) => <Icon size={s} color="#eab308"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></Icon>,
  eye: (s = 32) => <Icon size={s} color="#ef4444"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Icon>,
  activity: (s = 32) => <Icon size={s} color="#10b981"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>,
  clipboard: (s = 32) => <Icon size={s} color="#6366f1"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></Icon>,
  settings: (s = 32) => <Icon size={s} color="#78716c"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>,
  link: (s = 32) => <Icon size={s} color="#0ea5e9"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Icon>,
  database: (s = 32) => <Icon size={s} color="#06b6d4"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></Icon>,

  // Buttons
  arrowRight: (s = 20) => <Icon size={s} color="currentColor"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Icon>,
  shieldCheck: (s = 20) => <Icon size={s} color="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></Icon>,
};

const CATEGORIES = [
  { icon: 'shield', name: 'Endpoint Security' },
  { icon: 'flame', name: 'Firewall & UTM' },
  { icon: 'search', name: 'SIEM & SOC' },
  { icon: 'lock', name: 'Encryption & PKI' },
  { icon: 'cloud', name: 'Cloud Security' },
  { icon: 'mail', name: 'Email Security' },
  { icon: 'globe', name: 'Network Security' },
  { icon: 'cpu', name: 'AI/ML Security' },
  { icon: 'smartphone', name: 'Mobile Security' },
  { icon: 'key', name: 'IAM & Access Control' },
  { icon: 'eye', name: 'Threat Intelligence' },
  { icon: 'activity', name: 'Vulnerability Assessment' },
  { icon: 'clipboard', name: 'GRC & Compliance' },
  { icon: 'settings', name: 'OT/ICS Security' },
  { icon: 'link', name: 'Blockchain Security' },
  { icon: 'database', name: 'Data Protection & DLP' },
];

const OBJECTIVES = [
  { icon: 'crosshair', title: 'Identify', desc: 'Discover indigenous cybersecurity products built in India' },
  { icon: 'barChart', title: 'Compile', desc: 'Build a comprehensive registry of Indian cyber solutions' },
  { icon: 'award', title: 'Showcase', desc: 'Highlight capabilities to government & enterprises' },
  { icon: 'trendUp', title: 'Promote', desc: 'Drive adoption of homegrown cybersecurity technologies' },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* ── Nav ── */}
      <nav style={styles.nav}>
        <div className="container" style={styles.navInner}>
          <div style={styles.navBrand} onClick={() => router.push('/')}>
            <span>CERT-In & ICAN</span>
            <span style={{
              fontSize: '0.75rem',
              marginLeft: '0.75rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(99,102,241,0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(99,102,241,0.3)',
              verticalAlign: 'middle',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Registry Portal</span>
          </div>
          <button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.65rem 1.6rem', borderRadius: '10px' }} onClick={() => router.push('/login')} id="nav-apply-btn">
            Apply Now <span style={{ marginLeft: 6 }}>{icons.arrowRight(18)}</span>
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div className="container" style={styles.heroContent}>
          <div className="animate-fade-in-up" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={styles.heroLogos}>
              <div style={styles.heroLogoWrapper}>
                <img src="/logos/certin-logo.png" alt="CERT-In" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div style={styles.heroDivider} />
              <div style={styles.heroLogoWrapper}>
                <img src="/logos/ican-logo.png" alt="ICAN" style={{ height: '62px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div style={styles.heroDivider} />
              <div style={styles.heroLogoWrapper}>
                <img src="/logos/itel-logo.png" alt="ITEL" style={{ height: '66px', width: 'auto', objectFit: 'contain' }} />
              </div>
            </div>
            <div style={styles.badge}>
              <span style={styles.badgeDot} />
              Joint Initiative by CERT-In, ICAN & ITEL Foundation
            </div>
            <h1 style={styles.heroTitle}>
              <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Joint Call for Information on
              </span>
              <span className="text-gradient">Indigenous Cybersecurity</span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>Tools & Products</span>
            </h1>
            <p style={styles.heroDesc}>
              An initiative to identify, compile, showcase, and promote indigenous cybersecurity
              products, platforms, and solutions developed in India.
            </p>
            <div style={styles.heroCta}>
              <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')} id="hero-apply-btn">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {icons.shieldCheck(20)} Apply Now
                </span>
              </button>
              <a href="#objectives" className="btn btn-outline btn-lg">
                Learn More ↓
              </a>
            </div>
          </div>
        </div>
        <div style={styles.heroWave}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120Z" fill="var(--bg-secondary)" />
          </svg>
        </div>
      </section>

      {/* ── About ── */}
      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4xl) 0' }}>
        <div className="container">
          <div style={styles.aboutGrid}>
            <div>
              <h2 style={styles.sectionTitle}>About the <span className="text-gradient">Initiative</span></h2>
              <p style={styles.aboutText}>
                CERT-In (Indian Computer Emergency Response Team) and ICAN (Indian Cyber Assurance Nucleus),
                in collaboration with ITEL Foundation, have launched this joint initiative to create
                a comprehensive directory of indigenous cybersecurity tools and products developed in India.
              </p>
              <p style={styles.aboutText}>
                This initiative aims to strengthen India&apos;s cyber defence posture by promoting self-reliance
                in cybersecurity technologies, aligning with the vision of Atmanirbhar Bharat.
              </p>
            </div>
            <div style={styles.statsGrid}>
              {[
                { num: '20', label: 'Evaluation Criteria' },
                { num: '16', label: 'Product Categories' },
                { num: '3', label: 'Partner Organizations' },
                { num: '∞', label: 'Opportunities' },
              ].map((s, i) => (
                <div key={i} className="glass-card" style={styles.statCard}>
                  <span className="text-gradient" style={styles.statNum}>{s.num}</span>
                  <span style={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Objectives ── */}
      <section id="objectives" style={{ padding: 'var(--space-4xl) 0' }}>
        <div className="container">
          <h2 style={{ ...styles.sectionTitle, textAlign: 'center' }}>
            Our <span className="text-gradient">Objectives</span>
          </h2>
          <p style={styles.sectionSub}>Key goals driving this national cybersecurity initiative</p>
          <div style={styles.objGrid}>
            {OBJECTIVES.map((o, i) => (
              <div key={i} className="glass-card" style={styles.objCard}>
                <div style={styles.objIconWrap}>
                  {icons[o.icon](40)}
                </div>
                <h3 style={styles.objTitle}>{o.title}</h3>
                <p style={styles.objDesc}>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4xl) 0' }}>
        <div className="container">
          <h2 style={{ ...styles.sectionTitle, textAlign: 'center' }}>
            Product <span className="text-gradient">Categories</span>
          </h2>
          <p style={styles.sectionSub}>16 cybersecurity domains covered under this initiative</p>
          <div style={styles.catGrid}>
            {CATEGORIES.map((c, i) => (
              <div key={i} className="glass-card" style={styles.catCard}>
                <div style={styles.catIconWrap}>
                  {icons[c.icon](32)}
                </div>
                <span style={styles.catName}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'var(--space-4xl) 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="glass-card" style={styles.ctaCard}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: 'var(--space-md)' }}>
              Ready to <span className="text-gradient-warm">Submit</span> Your Product?
            </h2>
            <p style={{ ...styles.sectionSub, marginBottom: 'var(--space-xl)' }}>
              Join India&apos;s premier indigenous cybersecurity product registry
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')} id="cta-apply-btn">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Apply Now — It&apos;s Free {icons.arrowRight(18)}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <div className="container" style={styles.footerInner}>
          <div style={styles.footerLogos}>
            <img src="/logos/certin-logo.png" alt="CERT-In" style={{ ...styles.footerLogoImg, height: '44px' }} />
            <img src="/logos/ican-logo.png" alt="ICAN" style={{ ...styles.footerLogoImg, height: '44px' }} />
            <img src="/logos/itel-logo.png" alt="ITEL" style={{ ...styles.footerLogoImg, height: '54px' }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            © {new Date().getFullYear()} CERT-In & ICAN Joint Initiative. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(8, 11, 22, 0.9)', backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.4rem 0',
  },
  navInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navBrand: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.85rem',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '0.02em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  heroLogos: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '860px',
    margin: '0 auto 2.5rem auto',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(30, 41, 59, 0.2) 100%)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '2rem 3rem',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
  heroLogoWrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 1.5rem',
  },
  heroDivider: {
    width: '1px',
    height: '50px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  footerLogos: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.75rem',
    marginBottom: '0.5rem',
  },
  footerLogoImg: {
    height: '44px',
    objectFit: 'contain',
  },
  hero: {
    position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
    paddingTop: '80px', overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(59,130,246,0.08) 0%, transparent 60%)',
  },
  heroOrb1: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '-10%', right: '-10%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
    animation: 'float 8s ease-in-out infinite',
  },
  heroOrb2: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%', bottom: '10%', left: '-5%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
    animation: 'float 10s ease-in-out infinite reverse',
  },
  heroContent: { position: 'relative', zIndex: 2 },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)',
    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
    color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.5rem',
  },
  badgeDot: {
    width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)',
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.8rem)',
    fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem',
  },
  heroDesc: {
    fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 620,
    margin: '0 auto', marginBottom: '2rem', lineHeight: 1.7,
  },
  heroCta: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  heroWave: { position: 'absolute', bottom: -1, left: 0, right: 0, zIndex: 1 },
  sectionTitle: {
    fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    fontWeight: 700, marginBottom: 'var(--space-lg)',
  },
  sectionSub: {
    color: 'var(--text-secondary)', fontSize: '1.05rem', textAlign: 'center',
    maxWidth: 540, margin: '0 auto', marginBottom: 'var(--space-2xl)',
  },
  aboutGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3xl)', alignItems: 'center',
  },
  aboutText: { color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-md)', fontSize: '1rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' },
  statCard: { padding: 'var(--space-lg)', textAlign: 'center' },
  statNum: { display: 'block', fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800 },
  statLabel: { display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' },
  objGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)' },
  objCard: { padding: 'var(--space-xl)', textAlign: 'center' },
  objIconWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 72, height: 72, borderRadius: 'var(--radius-lg)', margin: '0 auto var(--space-md)',
    background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)',
  },
  objTitle: { fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-sm)' },
  objDesc: { color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' },
  catCard: { padding: 'var(--space-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' },
  catIconWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 56, height: 56, borderRadius: 'var(--radius-md)',
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
  },
  catName: { fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' },
  ctaCard: {
    padding: 'var(--space-3xl) var(--space-xl)',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(99,102,241,0.03))',
    border: '1px solid rgba(59,130,246,0.1)',
  },
  footer: {
    borderTop: '1px solid var(--border-color)', padding: 'var(--space-xl) 0',
    background: 'var(--bg-primary)',
  },
  footerInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
};
