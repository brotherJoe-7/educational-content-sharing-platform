import Link from 'next/link';
import { BookOpen, Upload, Search, Shield, Users, Download, Star, ArrowRight, CheckCircle, Globe, Zap, ChevronDown } from 'lucide-react';

const stats = [
  { label: 'Resources Shared', value: '5,000+', icon: BookOpen },
  { label: 'Active Educators', value: '1,200+', icon: Users },
  { label: 'Total Downloads', value: '48,000+', icon: Download },
  { label: 'Average Rating', value: '4.8 / 5', icon: Star },
];

const features = [
  {
    icon: Upload,
    title: 'Upload Resources',
    description: 'Share PDFs, notes, past papers, and tutorials with educators nationwide.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Search,
    title: 'Search & Discover',
    description: 'Find resources by subject, grade level, or keyword in seconds.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Shield,
    title: 'Legal & Ethical',
    description: 'All content is moderated and licensed under open Creative Commons licenses.',
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Globe,
    title: 'Sierra Leone Focused',
    description: 'Tailored specifically for Sierra Leone\'s national curriculum and standards.',
    color: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'No waiting — download approved resources immediately after registration.',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
  },
  {
    icon: CheckCircle,
    title: 'Quality Assured',
    description: 'Every resource is reviewed by administrators before publication.',
    color: 'from-cyan-500 to-sky-600',
    bg: 'bg-cyan-50',
  },
];

const subjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'];

export default function Home() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── Google Font Import ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .hero-gradient {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 70%, #2563eb 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.18);
        }
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #f1f5f9;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37, 99, 235, 0.5);
        }
        .btn-white {
          transition: all 0.3s ease;
        }
        .btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        .nav-link {
          transition: color 0.2s ease;
        }
        .subject-tag {
          transition: all 0.2s ease;
        }
        .subject-tag:hover {
          transform: scale(1.05);
        }
        .scroll-indicator {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .footer-gradient {
          background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
        }
      `}</style>

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                EduShare <span className="text-blue-600">Sierra Leone</span>
              </span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/resources" className="nav-link text-slate-600 hover:text-blue-600 text-sm font-medium">
                Browse Resources
              </Link>
              <Link href="/privacy" className="nav-link text-slate-600 hover:text-blue-600 text-sm font-medium">
                Privacy
              </Link>
              <Link href="/terms" className="nav-link text-slate-600 hover:text-blue-600 text-sm font-medium">
                Terms
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-slate-600 hover:text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl inline-flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="hero-gradient pt-16 min-h-screen flex flex-col justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-400 rounded-full opacity-10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 glass-card rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-blue-100 text-sm font-medium">🇸🇱 Built for Sierra Leone Educators</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Share Knowledge,
              <br />
              <span className="gradient-text">Shape the Future</span>
            </h1>

            <p className="text-lg md:text-xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              A legal, ethical platform for sharing open educational resources across Sierra Leone. 
              Discover past papers, notes, tutorials, and more — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="btn-primary inline-flex items-center justify-center space-x-2 text-white font-semibold px-8 py-4 rounded-2xl text-base"
              >
                <Upload className="h-5 w-5" />
                <span>Start Sharing Free</span>
              </Link>
              <Link
                href="/resources"
                className="btn-white inline-flex items-center justify-center space-x-2 bg-white text-slate-800 font-semibold px-8 py-4 rounded-2xl text-base"
              >
                <Search className="h-5 w-5" />
                <span>Browse Resources</span>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="stat-card rounded-2xl p-4 text-center">
                  <Icon className="h-6 w-6 text-blue-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">{value}</div>
                  <div className="text-blue-300 text-xs font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-blue-300 flex flex-col items-center scroll-indicator">
          <span className="text-xs mb-1">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Platform Features
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              Everything you need to share &amp; learn
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Designed from the ground up for educators, students, and institutions across Sierra Leone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="feature-card bg-white rounded-2xl p-6">
                <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center mb-5`}>
                  <div className={`bg-gradient-to-br ${color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Subjects Section ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Browse By Subject
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            All Subjects Covered
          </h2>
          <p className="text-slate-500 text-lg mb-12 max-w-xl mx-auto">
            From primary to university level — resources for every grade and curriculum.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {subjects.map((subject) => (
              <Link
                key={subject}
                href={`/resources`}
                className="subject-tag bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-medium px-5 py-2.5 rounded-full text-sm"
              >
                {subject}
              </Link>
            ))}
          </div>

          <Link
            href="/resources"
            className="btn-primary inline-flex items-center space-x-2 text-white font-semibold px-8 py-3.5 rounded-2xl"
          >
            <span>View All Resources</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─── License / Trust Section ─── */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                <Shield className="h-4 w-4 text-emerald-300" />
                <span className="text-sm font-medium text-blue-100">Open & Licensed Content</span>
              </div>
              <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                Trusted, Legal &amp; Ethical Sharing
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Every resource shared on this platform is licensed under open licenses such as 
                Creative Commons and OER. Administrators review all uploads before they go live, 
                ensuring quality and compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/privacy"
                  className="btn-white inline-flex items-center justify-center space-x-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl"
                >
                  <span>Privacy Policy</span>
                </Link>
                <Link
                  href="/license"
                  className="inline-flex items-center justify-center space-x-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
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
                <div key={label} className="glass-card rounded-xl p-5">
                  <CheckCircle className="h-6 w-6 text-emerald-300 mb-3" />
                  <div className="text-white font-semibold text-sm mb-1">{label}</div>
                  <div className="text-blue-200 text-xs">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Join the Community
          </div>
          <h2 className="text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Ready to make a difference?
          </h2>
          <p className="text-slate-500 text-xl mb-10 leading-relaxed">
            Join thousands of Sierra Leonean educators contributing to the future of education. 
            It's free, it's open, and it matters.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary inline-flex items-center justify-center space-x-2 text-white font-semibold px-10 py-4 rounded-2xl text-lg"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-10 py-4 rounded-2xl text-lg transition-colors"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="footer-gradient text-white" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">EduShare Sierra Leone</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                A legal and ethical platform empowering educators and students across Sierra Leone 
                through open educational resource sharing.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-3">
                {[
                  { href: '/resources', label: 'Browse Resources' },
                  { href: '/register', label: 'Create Account' },
                  { href: '/login', label: 'Sign In' },
                  { href: '/upload', label: 'Upload Resources' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-slate-400 hover:text-white text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                {[
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Use' },
                  { href: '/license', label: 'MIT License' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-slate-400 hover:text-white text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 EduShare Sierra Leone. Licensed under the MIT License.
            </p>
            <p className="text-slate-500 text-sm">
              Built with ❤️ for Sierra Leone's educators and students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
