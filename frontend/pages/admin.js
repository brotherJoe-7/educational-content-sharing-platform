import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Check, X, BookOpen, Users, Clock, TrendingUp, LogOut, 
  LayoutDashboard, FileText, Shield, BarChart3, Download,
  Star, Menu, X as Close, Search, Filter, Home, ArrowRight, User as UserIcon, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Admin() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingResources, setPendingResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [archivedResources, setArchivedResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [reuploadingId, setReuploadingId] = useState(null);
  const [reuploadProgress, setReuploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/resources');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, pendingRes, allRes, archivedRes, usersRes, logsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/pending`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/all`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/all?status=archived`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logs`, { headers })
      ]);

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      const allData = await allRes.json();
      const archivedData = await archivedRes.json();
      const usersData = await usersRes.json();
      const logsData = await logsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
        setAnalytics(statsData.analytics);
      }
      if (pendingData.success) setPendingResources(pendingData.resources);
      if (allData.success) setAllResources(allData.resources);
      if (archivedData.success) setArchivedResources(archivedData.resources);
      if (usersData.success) setUsers(usersData.users);
      if (logsData.success) setLogs(logsData.logs || []);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Resource approved successfully');
        fetchData();
      } else {
        toast.error(result.message || 'Approval failed');
      }
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Approval failed. Please try again.');
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Resource rejected successfully');
        setRejectReason('');
        setRejectingId(null);
        fetchData();
      } else {
        toast.error(result.message || 'Rejection failed');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Rejection failed. Please try again.');
    }
  };

  const handlePromote = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/promote`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('User promoted to admin successfully');
        fetchData();
      } else {
        toast.error(result.message || 'Promotion failed');
      }
    } catch (error) {
      console.error('Promotion error:', error);
      toast.error('Promotion failed. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to completely remove this user? This cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('User deleted successfully');
        fetchData(); // Refresh data
      } else {
        toast.error(result.message || 'Deletion failed');
      }
    } catch (error) {
      console.error('Deletion error:', error);
      toast.error('Deletion failed. Please try again.');
    }
  };

  const handleSuspendUser = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
        fetchData();
      } else {
        toast.error(result.message || 'Status change failed');
      }
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('Status change failed. Please try again.');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource? It will be moved to the archive for 7 days.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Resource archived successfully');
        fetchData(); // Refresh data
      } else {
        toast.error(result.message || 'Archiving failed');
      }
    } catch (error) {
      console.error('Resource archiving error:', error);
      toast.error('Archiving failed. Please try again.');
    }
  };

  const handleRestoreResource = async (resourceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/${resourceId}/restore`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Resource restored successfully');
        fetchData();
      } else {
        toast.error(result.message || 'Restore failed');
      }
    } catch (error) {
      console.error('Resource restore error:', error);
      toast.error('Restore failed. Please try again.');
    }
  };

  const handleForceDeleteResource = async (resourceId) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this resource? This cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/${resourceId}/force`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Resource permanently deleted');
        fetchData(); // Refresh data
      } else {
        toast.error(result.message || 'Permanent deletion failed');
      }
    } catch (error) {
      console.error('Resource permanent deletion error:', error);
      toast.error('Permanent deletion failed. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleReplaceFile = async (resourceId) => {
    const token = localStorage.getItem('token');
    // create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      setReuploadingId(resourceId);
      setReuploadProgress(0);
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/${resourceId}/reupload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: form
        });
        const data = await res.json();
        if (data.success) {
          toast.success('File replaced successfully');
          fetchData();
        } else {
          toast.error(data.message || 'Reupload failed');
        }
      } catch (err) {
        console.error('Reupload error', err);
        toast.error('Reupload failed');
      } finally {
        setReuploadingId(null);
        setReuploadProgress(0);
      }
    };
    input.click();
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'pending', icon: Clock, label: 'Pending Reviews', count: pendingResources.length },
    { id: 'resources', icon: FileText, label: 'All Resources' },
    { id: 'archive', icon: LogOut, label: 'Archive (Trash)' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'logs', icon: Shield, label: 'Activity Logs' },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
      <div className="min-w-0">
        <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1 uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{value}</p>
      </div>
      <div className={`p-2 sm:p-3 rounded-lg ${colorClass} shrink-0 ml-2`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .btn-blue { background: #2563eb; transition: background 0.15s; color: white; }
        .btn-blue:hover { background: #1d4ed8; }
        .btn-outline { border: 1px solid #e5e7eb; color: #374151; transition: all 0.15s; background: white; }
        .btn-outline:hover { border-color: #d1d5db; background: #f9fafb; }
      `}} />

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white border border-gray-200 p-2 rounded-lg shadow-sm text-gray-700"
      >
        {sidebarOpen ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold">Open Content Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === item.id ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-blue-400 font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-white truncate text-sm">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm font-medium border border-gray-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 overflow-auto w-full">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="pl-10 sm:pl-12 lg:pl-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Manage platform content and users.</p>
            </div>
            <div className="flex items-center space-x-3 pl-10 sm:pl-12 lg:pl-0">
              <Link
                href="/resources"
                className="btn-outline flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium"
              >
                <BookOpen className="h-4 w-4" />
                <span>View Site</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  colorClass="bg-blue-50 text-blue-600 border border-blue-100"
                />
                <StatCard
                  title="Total Resources"
                  value={stats.totalResources}
                  icon={FileText}
                  colorClass="bg-green-50 text-green-600 border border-green-100"
                />
                <StatCard
                  title="Pending Review"
                  value={stats.pendingResources}
                  icon={Clock}
                  colorClass="bg-yellow-50 text-yellow-600 border border-yellow-100"
                />
                <StatCard
                  title="Approved Resources"
                  value={stats.approvedResources}
                  icon={Check}
                  colorClass="bg-purple-50 text-purple-600 border border-purple-100"
                />
              </div>

              {/* Growth & Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Growth Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                    Growth Analytics
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">User and resource growth trends</p>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="text-gray-600 font-medium text-sm">New Uploads (7d)</span>
                      <span className="font-bold text-indigo-600 text-xl">+{stats.uploadsLastWeek || 0}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="text-gray-600 font-medium text-sm">New Uploads (30d)</span>
                      <span className="font-bold text-indigo-600 text-xl">+{stats.uploadsLastMonth || 0}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="text-gray-600 font-medium text-sm">Active Users (30d)</span>
                      <span className="font-bold text-green-600 text-xl">{stats.activeUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium text-sm">Rejected Resources</span>
                      <span className="font-bold text-red-500 text-xl">{stats.rejectedResources || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Resources by Subject */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Resources by Subject
                  </h3>
                  <div className="space-y-4">
                    {analytics?.resourcesBySubject?.slice(0, 5).map((item) => (
                      <div key={item._id}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-700 font-medium">{item._id}</span>
                          <span className="font-bold text-gray-900">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.max(5, (item.count / Math.max(stats.totalResources, 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {!analytics?.resourcesBySubject?.length && <p className="text-gray-400 text-sm">No data yet</p>}
                  </div>
                </div>

                {/* Resources by Grade */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    By Grade Level
                  </h3>
                  <div className="space-y-4">
                    {analytics?.resourcesByGrade?.slice(0, 5).map((item) => (
                      <div key={item._id}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-700 font-medium">{item._id}</span>
                          <span className="font-bold text-gray-900">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.max(5, (item.count / Math.max(stats.totalResources, 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {!analytics?.resourcesByGrade?.length && <p className="text-gray-400 text-sm">No data yet</p>}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Pending Resources Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              {pendingResources.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">There are no resources pending review at this time.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {pendingResources.map((resource) => (
                    <div key={resource._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 relative">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg mt-1 hidden sm:block">
                            <FileText className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{resource.title}</h3>
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Pending</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed max-w-3xl">{resource.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                                {resource.subject}
                              </span>
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                                {resource.gradeLevel}
                              </span>
                              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200 uppercase">
                                {resource.fileType}
                              </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 sm:gap-6">
                              <div className="flex items-center space-x-1.5">
                                <UserIcon className="h-4 w-4" />
                                <span>Author: {resource.author}</span>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <Upload className="h-4 w-4" />
                                <span>Uploaded by: {resource.uploadedBy?.name}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0 border-t border-gray-100 pt-3 sm:pt-4">
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('token');
                            const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/resources/${resource._id}/proxy`;
                            try {
                              const r = await fetch(proxyUrl, { headers: { Authorization: `Bearer ${token}` } });
                              if (!r.ok) throw new Error('Proxy failed');
                              
                              // We have to open a window and set its content, or download if it is a blob.
                              // Actually, standard window.open doesn't allow setting Authorization headers.
                              // Since admin proxy needs auth, we can fetch the blob and open an object URL!
                              const blob = await r.blob();
                              const objectUrl = URL.createObjectURL(blob);
                              window.open(objectUrl, '_blank');
                            } catch (e) {
                              console.error('Open file error', e);
                              toast.error('Failed to open file');
                            }
                          }}
                          className="flex-1 sm:flex-none btn-outline flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium"
                        >
                          <Download className="h-4 w-4" />
                          <span>View File</span>
                        </button>
                        <button
                          onClick={() => handleApprove(resource._id)}
                          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => setRejectingId(resource._id)}
                          className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleReplaceFile(resource._id)}
                          className="flex-1 sm:flex-none btn-outline flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Replace File</span>
                        </button>
                      </div>
                      
                      {/* Rejection Form Overlay/Inline */}
                      {rejectingId === resource._id && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl p-6 flex flex-col justify-center items-center z-10 border border-gray-200">
                          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 w-full max-w-md">
                            <h4 className="font-bold text-gray-900 mb-2">Reject Resource</h4>
                            <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting "{resource.title}". This helps the uploader understand why.</p>
                            <input
                              type="text"
                              placeholder="e.g., Inappropriate content, low quality..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
                              autoFocus
                            />
                            <div className="flex gap-3 justify-end">
                              <button
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectReason('');
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReject(resource._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                Confirm Rejection
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Resources Tab */}
          {activeTab === 'resources' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource Details</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject & Grade</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Metrics</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {allResources
                      .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.author.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((resource) => (
                      <tr key={resource._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-lg mr-4 shrink-0">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 line-clamp-1">{resource.title}</p>
                              <p className="text-sm text-gray-500 mt-0.5">By {resource.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded text-xs font-medium">
                              {resource.subject}
                            </span>
                            <span className="text-xs text-gray-500">{resource.gradeLevel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            resource.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            resource.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {resource.status === 'approved' && <Check className="w-3 h-3 mr-1" />}
                            {resource.status === 'rejected' && <X className="w-3 h-3 mr-1" />}
                            {resource.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            <span className="capitalize">{resource.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1 text-sm text-gray-600">
                            <span className="flex items-center"><Download className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> {resource.downloadCount}</span>
                            <span className="flex items-center"><Star className="w-3.5 h-3.5 mr-1.5 text-yellow-400" /> {resource.averageRating?.toFixed(1) || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteResource(resource._id)}
                            className="inline-flex items-center space-x-1.5 btn-outline px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {allResources.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          No resources found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Archived Resources Tab */}
          {activeTab === 'archive' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-red-50 flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <h2 className="text-base sm:text-lg font-bold text-red-900">Archived Resources (Soft Deleted)</h2>
              </div>
              <div className="p-4 text-sm text-gray-600 bg-gray-50 border-b border-gray-200">
                Resources here will be permanently deleted 7 days after they were archived.
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title & Info</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Archived Date</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-xs sm:text-sm">
                    {archivedResources.map((resource) => (
                      <tr key={resource._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="font-medium text-gray-900 max-w-[200px] sm:max-w-[300px] truncate" title={resource.title}>
                            {resource.title}
                          </div>
                          <div className="text-gray-500 mt-1 flex items-center gap-2">
                            <span>{resource.subject}</span>
                            <span className="text-gray-300">•</span>
                            <span>{resource.gradeLevel}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-500">
                          {resource.archivedAt ? new Date(resource.archivedAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleRestoreResource(resource._id)}
                              className="text-green-600 hover:text-green-900 bg-green-50 px-2 sm:px-3 py-1 rounded transition-colors"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleForceDeleteResource(resource._id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 px-2 sm:px-3 py-1 rounded transition-colors"
                            >
                              Force Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {archivedResources.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500 font-medium">
                          No resources currently in archive.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage platform administrators and users.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User Details</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((userItem) => (
                      <tr key={userItem._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-gray-100 border border-gray-200 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 font-bold mr-4 shrink-0">
                              {userItem.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{userItem.name}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{userItem.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${
                              userItem.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {userItem.role}
                            </span>
                            {userItem.status === 'suspended' && (
                              <span className="inline-flex px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border bg-red-50 text-red-700 border-red-200">
                                Suspended
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {userItem._id !== user?.id && userItem.email !== 'admin@educonnectsl.org' ? (
                              <>
                                {userItem.role !== 'admin' && (
                                  <button
                                    onClick={() => handlePromote(userItem._id)}
                                    className="inline-flex items-center space-x-1.5 btn-outline px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                  >
                                    <Shield className="h-4 w-4" />
                                    <span>Make Admin</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleSuspendUser(userItem._id, userItem.status === 'suspended' ? 'active' : 'suspended')}
                                  className="inline-flex items-center space-x-1.5 btn-outline px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                                >
                                  {userItem.status === 'suspended' ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                  <span>{userItem.status === 'suspended' ? 'Activate' : 'Suspend'}</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(userItem._id)}
                                  className="inline-flex items-center space-x-1.5 btn-outline px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Protected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-500" /> System Activity Logs
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Performed By</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-xs sm:text-sm">
                    {logs.map((log, i) => {
                      const getActionStyle = (action) => {
                        if (action.includes('login') || action.includes('register') || action.includes('activated') || action.includes('promoted')) return 'bg-green-50 text-green-700';
                        if (action.includes('upload') || action.includes('download') || action.includes('view')) return 'bg-blue-50 text-blue-700';
                        if (action.includes('delete') || action.includes('reject') || action.includes('suspend') || action.includes('failed')) return 'bg-red-50 text-red-700';
                        if (action.includes('rated') || action.includes('approved')) return 'bg-yellow-50 text-yellow-700';
                        return 'bg-gray-100 text-gray-700';
                      };
                      
                      const performedByText = log.performedBy?.name || log.performedByName || log.performedByEmail || 'System / Guest';
                      
                      return (
                      <tr key={log._id || i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-md uppercase tracking-wide ${getActionStyle(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 max-w-[150px] sm:max-w-[200px] truncate" title={log.resourceTitle || '-'}>
                          {log.resourceTitle || '-'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 max-w-[120px] sm:max-w-[150px] truncate" title={performedByText}>
                          {performedByText}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500">
                          <p className="line-clamp-2" title={log.details}>{log.details}</p>
                          {log.ipAddress && <span className="text-[10px] text-gray-400 mt-1 block">IP: {log.ipAddress}</span>}
                        </td>
                      </tr>
                      );
                    })}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">
                          No activity logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
