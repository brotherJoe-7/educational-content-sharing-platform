import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BookOpen, Upload, Search, Shield, Users, Download,
  Star, ArrowRight, CheckCircle, Globe, Zap, FileText, User, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentResources, setRecentResources] = useState([]);
  const [trendingSubjects, setTrendingSubjects] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`)
      .then(r => r.json())
      .then(data => { 
        if (data.success) {
          setStats(data.stats); 
          setTrendingSubjects(data.trendingSubjects || []);
          setRecentResources(data.recentResources || []);
        }
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));


  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/resources?q=${encodeURIComponent(searchQuery)}`);
  };

  const features = [
    { icon: Upload, title: 'Share Resources', description: 'Upload PDFs, notes, past papers, and tutorials for educators nationwide.' },
    { icon: Search, title: 'Smart Discovery', description: 'Find resources by subject, grade level, or keyword instantly.' },
    { icon: Shield, title: 'Moderated & Legal', description: 'Every resource is admin-reviewed and licensed under Creative Commons.' },
    { icon: Globe, title: 'Sierra Leone Focus', description: "Built specifically for Sierra Leone's national curriculum." },
    { icon: Zap, title: 'Instant Access', description: 'Download approved resources immediately with a free account.' },
    { icon: CheckCircle, title: 'Quality Assured', description: 'Administrators verify every upload before it goes live.' },
  ];

  const statItems = stats ? [
    { label: 'Resources', value: stats.totalResources?.toLocaleString() || '0', icon: FileText },
    { label: 'Educators', value: stats.totalUsers?.toLocaleString() || '0', icon: Users },
    { label: 'Downloads', value: stats.totalDownloads?.toLocaleString() || '0', icon: Download },
    { label: 'Avg Rating', value: stats.averageRating ? `${stats.averageRating}/5` : 'N/A', icon: Star },
  ] : [];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#FFFFFF' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #fff; color: #111827; }
        .nav-sticky { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #E5E7EB; }
        .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 68px; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo-icon { background: #1D4ED8; border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
        .nav-logo-text { font-size: 17px; font-weight: 800; color: #111827; letter-spacing: -0.3px; }
        .nav-links { display: flex; align-items: center; gap: 8px; }
        .nav-link { padding: 8px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #374151; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .nav-link:hover { background: #F3F4F6; color: #111827; }
        .nav-btn-primary { background: #1D4ED8; color: #fff; padding: 9px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: background 0.15s; border: none; cursor: pointer; }
        .nav-btn-primary:hover { background: #1E40AF; }
        .nav-btn-ghost { background: transparent; border: 1px solid #D1D5DB; color: #374151; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
        .nav-btn-ghost:hover { border-color: #9CA3AF; background: #F9FAFB; }
        .hero { background: #1D4ED8; padding: 80px 24px; text-align: center; }
        .hero-badge { display: inline-flex; align-items: center; background: #1E40AF; border: 1px solid #3B82F6; border-radius: 100px; padding: 6px 16px; font-size: 12px; font-weight: 700; color: #BFDBFE; letter-spacing: 1px; margin-bottom: 28px; text-transform: uppercase; }
        .hero h1 { font-size: clamp(32px, 5vw, 60px); font-weight: 900; color: #fff; line-height: 1.1; margin: 0 0 20px; letter-spacing: -1.5px; max-width: 780px; margin-left: auto; margin-right: auto; }
        .hero h1 span { color: #BAE6FD; }
        .hero-sub { font-size: 17px; color: #BFDBFE; max-width: 520px; margin: 0 auto 40px; line-height: 1.65; font-weight: 400; }
        .search-bar { background: #fff; border-radius: 14px; padding: 6px 6px 6px 24px; max-width: 680px; margin: 0 auto 56px; display: flex; align-items: center; gap: 8px; box-shadow: 0 16px 48px rgba(0,0,0,0.25); }
        .search-bar input { flex: 1; border: none; outline: none; font-size: 16px; font-family: inherit; color: #111827; background: transparent; }
        .search-bar input::placeholder { color: #9CA3AF; }
        .search-bar button { background: #1D4ED8; color: #fff; border: none; border-radius: 10px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.15s; white-space: nowrap; font-family: inherit; }
        .search-bar button:hover { background: #1E40AF; }
        .trending-pill-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; max-width: 800px; margin: 0 auto; }
        .trending-pill { display: inline-flex; align-items: center; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 100px; color: #fff; font-size: 14px; font-weight: 500; text-decoration: none; transition: background 0.2s; }
        .trending-pill:hover { background: rgba(255,255,255,0.25); }
        .section { max-width: 1200px; margin: 0 auto; padding: 80px 24px; }
        .section-label { font-size: 13px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .section-title { font-size: clamp(26px, 3vw, 40px); font-weight: 800; color: #111827; letter-spacing: -0.5px; margin: 0 0 14px; }
        .section-sub { font-size: 17px; color: #6B7280; max-width: 560px; line-height: 1.6; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
        .feature-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 28px; transition: box-shadow 0.2s, transform 0.2s; }
        .feature-card:hover { box-shadow: 0 12px 32px rgba(29,78,216,0.1); transform: translateY(-4px); border-color: #BFDBFE; }
        .feature-icon { background: #EFF6FF; border-radius: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .feature-title { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 8px; }
        .feature-desc { font-size: 14px; color: #6B7280; line-height: 1.6; }
        .bg-gray { background: #F9FAFB; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB; }
        .subjects-wrap { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 32px; justify-content: center; }
        .subject-chip { background: #fff; border: 1px solid #E5E7EB; border-radius: 100px; padding: 8px 18px; font-size: 14px; font-weight: 500; color: #374151; text-decoration: none; transition: all 0.15s; }
        .subject-chip:hover { background: #1D4ED8; color: #fff; border-color: #1D4ED8; }
        .cta-section { background: #1D4ED8; padding: 80px 24px; text-align: center; }
        .cta-section h2 { font-size: clamp(28px, 3vw, 44px); font-weight: 900; color: #fff; letter-spacing: -1px; margin: 0 0 16px; }
        .cta-section p { font-size: 18px; color: #BFDBFE; margin: 0 0 36px; }
        .btn-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .btn-white { background: #fff; color: #1D4ED8; border: none; border-radius: 10px; padding: 14px 32px; font-size: 16px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.15s; font-family: inherit; }
        .btn-white:hover { background: #EFF6FF; }
        .btn-outline-white { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.4); border-radius: 10px; padding: 14px 32px; font-size: 16px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.15s; font-family: inherit; }
        .btn-outline-white:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.7); }
        .footer { background: #111827; padding: 60px 24px 32px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .footer-logo-icon { background: #1D4ED8; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
        .footer-logo-text { font-size: 16px; font-weight: 800; color: #fff; }
        .footer-desc { font-size: 14px; color: #9CA3AF; line-height: 1.7; }
        .footer-heading { font-size: 12px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .footer-link { display: block; font-size: 14px; color: #6B7280; text-decoration: none; margin-bottom: 10px; transition: color 0.15s; }
        .footer-link:hover { color: #fff; }
        .footer-bottom { border-top: 1px solid #1F2937; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .recent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 40px; }
        .recent-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; transition: transform 0.2s, box-shadow 0.2s; text-align: left; }
        .recent-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); border-color: #BFDBFE; }
        .recent-subj { font-size: 12px; font-weight: 700; color: #2563EB; text-transform: uppercase; background: #EFF6FF; padding: 4px 10px; border-radius: 100px; display: inline-block; margin-bottom: 12px; }
        .recent-title { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .recent-desc { font-size: 14px; color: #6B7280; margin-bottom: 16px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .recent-meta { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 16px; }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .features-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
          .search-bar { flex-direction: column; padding: 12px; }
          .search-bar button { width: 100%; justify-content: center; }
          .nav-links { display: none; }
        }
      `}} />

      {/* ── Navigation ── */}
      <nav className="nav-sticky">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">
              <BookOpen style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <span className="nav-logo-text">Open Content <span style={{ color: '#2563EB' }}>SL</span></span>
          </Link>

          <div className="nav-links">
            <Link href="/resources" className="nav-link">Browse Resources</Link>
            <Link href="/upload" className="nav-link">Upload</Link>
            <Link href="/privacy" className="nav-link">Privacy</Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="nav-link" style={{ color: '#2563EB' }}>Admin</Link>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <>
                <Link href={user.role === 'admin' ? '/admin' : '/resources'} className="nav-btn-ghost">
                  <User style={{ width: 15, height: 15 }} />
                  <span>{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className="nav-btn-ghost">
                  <LogOut style={{ width: 15, height: 15 }} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-btn-ghost">Sign In</Link>
                <Link href="/register" className="nav-btn-primary">
                  Get Started <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-badge">BUILT FOR SIERRA LEONE</div>
        <h1>Find Resources That <span>Shape Your Future.</span></h1>
        <p className="hero-sub">
          Access thousands of verified past papers, notes, and tutorials shared by top educators. Free, legal, and open.
        </p>

        <form onSubmit={handleSearch} className="search-bar">
          <Search style={{ width: 20, height: 20, color: '#9CA3AF', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by subject, grade level, or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <Search style={{ width: 16, height: 16 }} />
            Search
          </button>
        </form>

        <div className="stats-grid" style={{ display: 'none' }}></div> {/* Removed stats entirely */}

        <div style={{ marginTop: '20px' }}>
          <div style={{ color: '#93C5FD', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            Popular Topics Right Now
          </div>
          <div className="trending-pill-container">
            {statsLoading ? (
               <div style={{ color: '#BFDBFE' }}>Loading trending topics...</div>
            ) : trendingSubjects.length > 0 ? (
               trendingSubjects.map(sub => (
                 <Link key={sub} href={`/resources?subject=${encodeURIComponent(sub)}`} className="trending-pill">
                   {sub}
                 </Link>
               ))
            ) : (
               <div style={{ color: '#BFDBFE', fontSize: '14px' }}>New topics will appear here as users download and rate resources!</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Uploads ── */}
      <div style={{ background: '#F9FAFB', padding: '80px 24px' }}>
        <div className="section" style={{ padding: 0 }}>
          <div className="section-label">Fresh Content</div>
          <h2 className="section-title">Recently Uploaded Resources</h2>
          <p className="section-sub">Discover the latest materials shared by educators across the country.</p>
          
          <div className="recent-grid">
            {recentResources.map(resource => (
              <div key={resource._id} className="recent-card">
                <div className="recent-subj">{resource.subject}</div>
                <div className="recent-title">{resource.title}</div>
                <div className="recent-desc">{resource.description}</div>
                <div className="recent-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download style={{ width: 14, height: 14 }} /> {resource.downloadCount}
                  </span>
                  <Link href={`/resources`} className="nav-btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    View Resource
                  </Link>
                </div>
              </div>
            ))}
            {recentResources.length === 0 && !statsLoading && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                No resources uploaded yet. Be the first to share!
              </div>
            )}
          </div>
          
          {recentResources.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link href="/resources" className="nav-btn-primary" style={{ display: 'inline-flex', padding: '12px 28px', fontSize: '15px' }}>
                Browse All Content <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ background: '#fff' }}>
        <div className="section">
          <div className="section-label">Platform Features</div>
          <h2 className="section-title">Everything you need to learn & share</h2>
          <p className="section-sub">Designed for educators, students, and institutions across Sierra Leone.</p>
          <div className="features-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon">
                  <Icon style={{ width: 22, height: 22, color: '#2563EB' }} />
                </div>
                <div className="feature-title">{title}</div>
                <div className="feature-desc">{description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* ── Licensing ── */}
      <div style={{ background: '#fff' }}>
        <div className="section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="section-label">Open & Licensed</div>
              <h2 className="section-title">Trusted, Legal & Ethical</h2>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 32 }}>
                Every resource is licensed under Creative Commons or OER. Administrators review all uploads before they go live.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/privacy" className="nav-btn-primary" style={{ textDecoration: 'none' }}>Privacy Policy</Link>
                <Link href="/license" className="nav-btn-ghost" style={{ textDecoration: 'none' }}>View License</Link>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Creative Commons BY', desc: 'Attribution required' },
                { label: 'CC BY-SA', desc: 'Share-alike required' },
                { label: 'OER', desc: 'Open Educational Resources' },
                { label: 'Public Domain', desc: 'No restrictions' },
              ].map(({ label, desc }) => (
                <div key={label} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 14, padding: 20 }}>
                  <CheckCircle style={{ width: 20, height: 20, color: '#2563EB', marginBottom: 10 }} />
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="cta-section">
        <h2>Ready to build the future of education?</h2>
        <p>Join educators across Sierra Leone sharing knowledge that matters.</p>
        <div className="btn-row">
          <Link href="/register" className="btn-white">
            Create Free Account <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
          <Link href="/login" className="btn-outline-white">Sign In</Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <BookOpen style={{ width: 16, height: 16, color: '#fff' }} />
                </div>
                <span className="footer-logo-text">Open Content Sierra Leone</span>
              </div>
              <p className="footer-desc">
                A legal, ethical platform empowering educators and students across Sierra Leone through open educational resource sharing.
              </p>
            </div>
            <div>
              <div className="footer-heading">Platform</div>
              {[['Browse Resources', '/resources'], ['Create Account', '/register'], ['Sign In', '/login'], ['Upload', '/upload']].map(([label, href]) => (
                <Link key={href} href={href} className="footer-link">{label}</Link>
              ))}
            </div>
            <div>
              <div className="footer-heading">Legal</div>
              {[['Privacy Policy', '/privacy'], ['Terms of Use', '/terms'], ['MIT License', '/license']].map(([label, href]) => (
                <Link key={href} href={href} className="footer-link">{label}</Link>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">&copy; 2026 Open Content Sierra Leone. Licensed under MIT.</span>
            <span className="footer-copy">Engineered for Sierra Leone educators.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
