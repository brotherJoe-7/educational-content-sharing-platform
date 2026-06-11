import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen, Upload, Search, Shield, Users, Download,
  Star, ArrowRight, CheckCircle, Globe, Zap, FileText, User, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  useEffect(() => {
    // Fetch real-time platform stats
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    // Fetch real subjects from approved resources
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/filters`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setSubjects(data.filters.subjects || []);
      })
      .catch(() => {})
      .finally(() => setSubjectsLoading(false));
  }, []);

  const features = [
    {
      icon: Upload,
      title: 'Upload Resources',
      description: 'Share PDFs, notes, past papers, and tutorials with educators nationwide.',
    },
    {
      icon: Search,
      title: 'Search & Discover',
      description: 'Find resources by subject, grade level, or keyword in seconds.',
    },
    {
      icon: Shield,
      title: 'Legal & Ethical',
      description: 'All content is reviewed by admins and licensed under open Creative Commons licenses.',
    },
    {
      icon: Globe,
      title: 'Sierra Leone Focused',
      description: "Tailored specifically for Sierra Leone's national curriculum and grade levels.",
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Download approved resources immediately after creating a free account.',
    },
    {
      icon: CheckCircle,
      title: 'Quality Assured',
      description: 'Every resource is reviewed by administrators before it is published.',
    },
  ];

  const statItems = stats
    ? [
        { label: 'Resources Available', value: stats.totalResources.toLocaleString(), icon: FileText },
        { label: 'Registered Educators', value: stats.totalUsers.toLocaleString(), icon: Users },
        { label: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), icon: Download },
        {
          label: 'Average Rating',
          value: stats.averageRating ? `${stats.averageRating} / 5` : 'N/A',
          icon: Star,
        },
      ]
    : null;

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: #2563eb; }
        .btn-blue { background: #2563eb; transition: background 0.15s; }
        .btn-blue:hover { background: #1d4ed8; }
        .btn-outline { border: 2px solid #2563eb; color: #2563eb; transition: all 0.15s; }
        .btn-outline:hover { background: #2563eb; color: #fff; }
        .feature-card { border: 1px solid #e5e7eb; transition: box-shadow 0.2s, border-color 0.2s; }
        .feature-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #2563eb; }
        .subject-tag { border: 1px solid #e5e7eb; transition: all 0.15s; }
        .subject-tag:hover { background: #2563eb; color: #fff; border-color: #2563eb; }
        .stat-card { border: 1px solid #e5e7eb; }
        .skeleton { background: #f3f4f6; border-radius: 4px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-900 text-base">EduShare Sierra Leone</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/resources" className="nav-link text-sm font-medium text-gray-600">Browse Resources</Link>
              <Link href="/privacy" className="nav-link text-sm font-medium text-gray-600">Privacy</Link>
              <Link href="/terms" className="nav-link text-sm font-medium text-gray-600">Terms</Link>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link href={user.role === 'admin' ? '/admin' : '/resources'} className="text-sm font-semibold text-gray-600 hover:text-blue-600 px-3 py-2 transition-colors flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button onClick={logout} className="btn-outline text-sm font-semibold px-4 py-2 rounded-lg inline-flex items-center space-x-1.5">
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600 px-3 py-2 transition-colors">
                    Log In
                  </Link>
                  <Link href="/register" className="btn-blue text-white text-sm font-semibold px-5 py-2 rounded-lg inline-flex items-center space-x-1.5">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="border-b border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-8">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wide">🇸🇱 Built for Sierra Leone</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Share Knowledge,<br />
            <span className="text-blue-600">Shape the Future</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A legal, ethical platform for sharing open educational resources across Sierra Leone.
            Discover past papers, notes, tutorials, and more — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            {user ? (
               <Link href="/upload" className="btn-blue inline-flex items-center justify-center space-x-2 text-white font-semibold px-8 py-3.5 rounded-lg text-base">
                 <Upload className="h-4 w-4" />
                 <span>Upload Resource</span>
               </Link>
            ) : (
               <Link href="/register" className="btn-blue inline-flex items-center justify-center space-x-2 text-white font-semibold px-8 py-3.5 rounded-lg text-base">
                 <Upload className="h-4 w-4" />
                 <span>Start Sharing Free</span>
               </Link>
            )}
            <Link href="/resources" className="btn-outline inline-flex items-center justify-center space-x-2 font-semibold px-8 py-3.5 rounded-lg text-base">
              <Search className="h-4 w-4" />
              <span>Browse Resources</span>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="stat-card rounded-xl p-5 text-center">
                    <div className="skeleton h-7 w-16 mx-auto mb-2" />
                    <div className="skeleton h-3 w-24 mx-auto" />
                  </div>
                ))
              : statItems?.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="stat-card rounded-xl p-5 text-center">
                    <Icon className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-3">Platform Features</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Everything you need to share &amp; learn</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Designed for educators, students, and institutions across Sierra Leone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="feature-card bg-white rounded-xl p-6">
                <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subjects (Dynamic) ── */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-3">Browse By Subject</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">All Subjects Covered</h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            From primary to university level — resources for every grade and curriculum.
          </p>

          {subjectsLoading ? (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-9 w-24 rounded-full" />
              ))}
            </div>
          ) : subjects.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {subjects.map((subject) => (
                <Link
                  key={subject}
                  href={`/resources?subject=${encodeURIComponent(subject)}`}
                  className="subject-tag bg-white text-gray-700 font-medium px-5 py-2 rounded-full text-sm"
                >
                  {subject}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mb-10 text-sm">No subjects available yet — be the first to upload!</p>
          )}

          <Link href="/resources" className="btn-blue inline-flex items-center space-x-2 text-white font-semibold px-7 py-3 rounded-lg text-sm">
            <span>View All Resources</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Trust / Licensing ── */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-3">Open &amp; Licensed</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Trusted, Legal &amp; Ethical Sharing</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Every resource is licensed under Creative Commons or OER. Administrators review all uploads 
                before they go live, ensuring quality and legal compliance for Sierra Leone's educators.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/privacy" className="btn-blue inline-flex items-center justify-center space-x-2 text-white font-semibold px-6 py-2.5 rounded-lg text-sm">
                  <span>Privacy Policy</span>
                </Link>
                <Link href="/license" className="btn-outline inline-flex items-center justify-center space-x-2 font-semibold px-6 py-2.5 rounded-lg text-sm">
                  <span>View License</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Creative Commons BY', desc: 'Attribution required' },
                { label: 'Creative Commons BY-SA', desc: 'Share-alike required' },
                { label: 'OER', desc: 'Open Educational Resources' },
                { label: 'Public Domain', desc: 'No restrictions on use' },
              ].map(({ label, desc }) => (
                <div key={label} className="stat-card bg-white rounded-xl p-5">
                  <CheckCircle className="h-5 w-5 text-blue-600 mb-3" />
                  <div className="font-semibold text-gray-900 text-sm mb-0.5">{label}</div>
                  <div className="text-gray-500 text-xs">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to make a difference?</h2>
          <p className="text-gray-500 text-lg mb-8">
            Join educators across Sierra Leone contributing to the future of education. 
            It's free, open, and it matters.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn-blue inline-flex items-center justify-center space-x-2 text-white font-semibold px-9 py-3.5 rounded-lg text-base">
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-9 py-3.5 rounded-lg text-base transition-colors">
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-white">EduShare Sierra Leone</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                A legal and ethical platform empowering educators and students across Sierra Leone 
                through open educational resource sharing.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/resources', label: 'Browse Resources' },
                  { href: '/register', label: 'Create Account' },
                  { href: '/login', label: 'Sign In' },
                  { href: '/upload', label: 'Upload Resources' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Use' },
                  { href: '/license', label: 'MIT License' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-500 text-sm">© 2026 EduShare Sierra Leone. Licensed under the MIT License.</p>
            <p className="text-gray-500 text-sm">Built for Sierra Leone's educators and students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
