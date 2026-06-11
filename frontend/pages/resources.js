import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, Filter, Download, Star, Upload, LogOut, BookOpen, Grid3X3, List, Share2, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Resources() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    gradeLevel: '',
    licenseType: '',
    sortBy: 'createdAt'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, filters]);

  const fetchResources = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources`);
      const data = await response.json();
      if (data.success) {
        setResources(data.resources);
        setFilteredResources(data.resources);
      }
    } catch (error) {
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.subject) {
      filtered = filtered.filter(r => r.subject === filters.subject);
    }

    if (filters.gradeLevel) {
      filtered = filtered.filter(r => r.gradeLevel === filters.gradeLevel);
    }

    if (filters.licenseType) {
      filtered = filtered.filter(r => r.licenseType === filters.licenseType);
    }

    // Sort
    if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.averageRating - a.averageRating);
    } else if (filters.sortBy === 'downloads') {
      filtered.sort((a, b) => b.downloadCount - a.downloadCount);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredResources(filtered);
  };

  const handleDownload = async (id, title) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/${id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = title;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Download started');
      }
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleShare = (resource) => {
    const shareUrl = `${window.location.origin}/resources/${resource._id}`;
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading resources...</p>
        </div>
      </div>
    );
  }

  const ResourceCard = ({ resource }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-5 sm:p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <span className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
            {resource.subject}
          </span>
          <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">{resource.averageRating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
            {resource.gradeLevel}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
            {resource.fileType}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
            {resource.licenseType}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            {resource.author}
          </span>
          <span className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            {resource.downloadCount}
          </span>
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex space-x-2 w-full">
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-100"
            >
              <BookOpen className="h-4 w-4" />
              <span>Read</span>
            </a>
            <button
              onClick={() => handleDownload(resource._id, resource.title)}
              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
          <button
            onClick={() => handleShare(resource)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 shrink-0"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ResourceListItem = ({ resource }) => (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-shrink-0">
          <div className="bg-blue-600 p-4 rounded-xl">
            <FileText className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">{resource.title}</h3>
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700">{resource.averageRating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
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
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="mr-4">By {resource.author}</span>
            <span className="flex items-center mr-4">
              <Download className="h-4 w-4 mr-1" />
              {resource.downloadCount} downloads
            </span>
          </div>
        </div>
        <div className="flex lg:flex-col gap-2">
          <button
            onClick={() => handleDownload(resource._id, resource.fileName)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          <button
            onClick={() => handleShare(resource)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">EduShare Sierra Leone</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden sm:block">Welcome, {user?.name}</span>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-xl font-medium transition-colors">
                  Admin Dashboard
                </Link>
              )}
              <Link href="/upload" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600 px-3 py-2 rounded-xl font-medium transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Resources</h1>
          <p className="text-gray-600">Discover and download educational materials for Sierra Leone</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                showFilters 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 grid md:grid-cols-4 gap-4">
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
              </select>
              <select
                value={filters.gradeLevel}
                onChange={(e) => setFilters({ ...filters, gradeLevel: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Grade Levels</option>
                <option value="Primary 1-3">Primary 1-3</option>
                <option value="Primary 4-6">Primary 4-6</option>
                <option value="JSS 1-3">JSS 1-3</option>
                <option value="SSS 1-3">SSS 1-3</option>
                <option value="University">University</option>
              </select>
              <select
                value={filters.licenseType}
                onChange={(e) => setFilters({ ...filters, licenseType: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Licenses</option>
                <option value="Creative Commons BY">Creative Commons BY</option>
                <option value="Creative Commons BY-SA">Creative Commons BY-SA</option>
                <option value="Creative Commons BY-NC">Creative Commons BY-NC</option>
                <option value="OER">OER</option>
                <option value="Public Domain">Public Domain</option>
              </select>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Sort by: Newest</option>
                <option value="rating">Sort by: Rating</option>
                <option value="downloads">Sort by: Downloads</option>
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredResources.length}</span> resources found
          </p>
          {(filters.subject || filters.gradeLevel || filters.licenseType || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ subject: '', gradeLevel: '', licenseType: '', sortBy: 'createdAt' });
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Resource Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <ResourceListItem key={resource._id} resource={resource} />
            ))}
          </div>
        )}

        {filteredResources.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No resources found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ subject: '', gradeLevel: '', licenseType: '', sortBy: 'createdAt' });
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
