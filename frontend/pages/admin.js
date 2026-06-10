import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Check, X, BookOpen, Users, Clock, TrendingUp, LogOut, 
  LayoutDashboard, FileText, Shield, BarChart3, Download,
  Star, Menu, X as Close, ChevronRight, Search, Filter
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
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
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

      const [statsRes, pendingRes, allRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/pending`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/resources/all`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { headers })
      ]);

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      const allData = await allRes.json();
      const usersData = await usersRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
        setAnalytics(statsData.analytics);
      }
      if (pendingData.success) setPendingResources(pendingData.resources);
      if (allData.success) setAllResources(allData.resources);
      if (usersData.success) setUsers(usersData.users);
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

      if (response.ok) {
        toast.success('Resource approved successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Approval failed');
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

      if (response.ok) {
        toast.success('Resource rejected successfully');
        setRejectReason('');
        setRejectingId(null);
        fetchData();
      }
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const handlePromote = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/promote`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('User promoted to admin successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Promotion failed');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pending', icon: Clock, label: 'Pending Review', count: pendingResources.length },
    { id: 'resources', icon: FileText, label: 'All Resources' },
    { id: 'users', icon: Users, label: 'User Management' },
  ];

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`${color} rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-xl">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md"
      >
        {sidebarOpen ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link href="/resources" className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">EduShare Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === item.id ? 'bg-white/20' : 'bg-red-100 text-red-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 overflow-auto">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
            </div>
            <Link
              href="/resources"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>View Site</span>
            </Link>
          </div>
        </header>

        {/* Content area */}
        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  color="bg-blue-600"
                />
                <StatCard
                  title="Total Resources"
                  value={stats.totalResources}
                  icon={BookOpen}
                  color="bg-green-600"
                />
                <StatCard
                  title="Pending Review"
                  value={stats.pendingResources}
                  icon={Clock}
                  color="bg-yellow-600"
                />
                <StatCard
                  title="Approved Resources"
                  value={stats.approvedResources}
                  icon={Check}
                  color="bg-purple-600"
                />
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Uploads This Week"
                  value={stats.uploadsLastWeek || 0}
                  icon={TrendingUp}
                  color="bg-indigo-600"
                />
                <StatCard
                  title="Total Downloads"
                  value={stats.totalDownloads || 0}
                  icon={Download}
                  color="bg-pink-600"
                />
                <StatCard
                  title="Active Users"
                  value={stats.activeUsers || 0}
                  icon={Shield}
                  color="bg-teal-600"
                />
              </div>

              {/* Analytics Section */}
              {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Resources by Subject */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Resources by Subject
                    </h3>
                    <div className="space-y-3">
                      {analytics.resourcesBySubject?.slice(0, 5).map((item) => (
                        <div key={item._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{item._id}</span>
                            <span className="font-medium text-gray-800">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(item.count / stats.totalResources) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resources by Grade */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                      Resources by Grade Level
                    </h3>
                    <div className="space-y-3">
                      {analytics.resourcesByGrade?.slice(0, 5).map((item) => (
                        <div key={item._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{item._id}</span>
                            <span className="font-medium text-gray-800">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(item.count / stats.totalResources) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pending Resources Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingResources.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Pending Resources</h3>
                  <p className="text-gray-500">All resources have been reviewed</p>
                </div>
              ) : (
                pendingResources.map((resource) => (
                  <div key={resource._id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 p-3 rounded-xl">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">{resource.title}</h3>
                            <p className="text-gray-600 mt-1">{resource.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {resource.subject}
                              </span>
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                {resource.gradeLevel}
                              </span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                {resource.fileType}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-3">
                              <span className="font-medium">Author:</span> {resource.author}
                            </p>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Uploaded by:</span> {resource.uploadedBy?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex lg:flex-col gap-2">
                        <button
                          onClick={() => handleApprove(resource._id)}
                          className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md"
                        >
                          <Check className="h-5 w-5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => setRejectingId(resource._id)}
                          className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md"
                        >
                          <X className="h-5 w-5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                    {rejectingId === resource._id && (
                      <div className="mt-4 pt-4 border-t">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason
                        </label>
                        <input
                          type="text"
                          placeholder="Please provide a reason for rejection"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(resource._id)}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                          >
                            Confirm Rejection
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason('');
                            }}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* All Resources Tab */}
          {activeTab === 'resources' && (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Resource</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Downloads</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allResources
                      .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((resource) => (
                      <tr key={resource._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{resource.title}</p>
                              <p className="text-sm text-gray-500">{resource.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {resource.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{resource.gradeLevel}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            resource.status === 'approved' ? 'bg-green-100 text-green-700' :
                            resource.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {resource.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{resource.downloadCount}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-gray-600">{resource.averageRating?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800">User Management</h3>
                <p className="text-sm text-gray-500">Manage platform users and permissions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {userItem.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-medium text-gray-800">{userItem.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{userItem.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userItem.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {userItem.role !== 'admin' && (
                            <button
                              onClick={() => handlePromote(userItem._id)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              <Shield className="h-4 w-4" />
                              <span>Promote to Admin</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
