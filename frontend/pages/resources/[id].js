import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Download, Star, Share2, FileText, UserIcon, Clock, Maximize, Minimize, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ResourceDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, rating: 0, comment: '' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchResourceDetails();
    }
  }, [id]);

  useEffect(() => {
    if (resource && resource.fileType?.toLowerCase() === 'pdf' && !isMobile) {
      loadPdfBlob(resource._id);
    }
    // Cleanup blob URL on unmount
    return () => { if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl); };
  }, [resource, isMobile]);

  const fetchResourceDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/${id}`);
      const data = await response.json();
      if (data.success) {
        setResource(data.resource);
      } else {
        toast.error(data.message || 'Failed to load resource');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch resource details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch the PDF as a blob to create a same-origin URL (avoids cross-origin download issue)
  const loadPdfBlob = async (resourceId) => {
    setPdfLoading(true);
    try {
      const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL}/resources/${resourceId}/download/proxy?inline=true`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch (err) {
      console.error('PDF blob error:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/${id}/download`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.downloadUrl) {
          const link = document.createElement('a');
          link.href = data.downloadUrl;
          link.download = data.fileName || resource.title;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('Download started');
        }
      } else {
        toast.error('Download failed');
      }
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: resource?.title,
        text: resource?.description,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  const handleRate = async () => {
    if (!ratingModal.rating) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to rate');
        router.push('/login');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/${id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: ratingModal.rating,
          comment: ratingModal.comment
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Rating submitted successfully');
        setRatingModal({ isOpen: false, rating: 0, comment: '' });
        fetchResourceDetails(); // refresh
      } else {
        toast.error(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Resource not found</h2>
        <Link href="/resources" className="text-blue-600 hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Resources
        </Link>
      </div>
    );
  }

  const inlineViewUrl = (isMobile && resource?.fileUrl) 
    ? resource.fileUrl 
    : `${process.env.NEXT_PUBLIC_API_URL}/resources/${resource?._id}/download/proxy?inline=true`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header navigation */}
        <Link href="/resources" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Link>

        {/* Resource Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex-shrink-0">
                <FileText className="h-16 w-16 text-blue-600" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">{resource.title}</h1>
                  <p className="text-gray-500 mt-2 flex items-center space-x-4">
                    <span className="flex items-center"><UserIcon className="h-4 w-4 mr-1"/> {resource.author}</span>
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1"/> {new Date(resource.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{resource.subject}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{resource.gradeLevel}</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium uppercase">{resource.fileType}</span>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">
                  {resource.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                  <button onClick={handleDownload} className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm">
                    <Download className="h-5 w-5 mr-2" /> Download ({resource.downloadCount})
                  </button>
                  <button onClick={() => setRatingModal({ isOpen: true, rating: 0, comment: '' })} className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" /> Rate ({resource.averageRating?.toFixed(1) || '0'})
                  </button>
                  <button onClick={handleShare} className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors">
                    <Share2 className="h-5 w-5 mr-2 text-blue-500" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 flex flex-col rounded-none border-0' : ''}`}>
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center shrink-0">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-500"/>
              {isFullscreen ? resource.title : 'Document Preview'}
            </h3>
            <div className="flex items-center space-x-2">
              {!isFullscreen && (
                ['pdf', 'txt', 'png', 'jpg', 'jpeg'].includes(resource.fileType?.toLowerCase()) ? (
                  <span className="hidden sm:inline-flex text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">Preview Available</span>
                ) : (
                  <span className="hidden sm:inline-flex text-sm text-yellow-600 font-medium bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">Preview may be limited</span>
                )
              )}
              {/* Open in new tab button as reliable fallback */}
              <a
                href={inlineViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Open in Tab</span>
              </a>
              {isFullscreen ? (
                <>
                  <button 
                    onClick={() => setIsFullscreen(false)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Minimize className="h-4 w-4" /> <span className="hidden sm:inline">Minimize</span>
                  </button>
                  <button 
                    onClick={() => setIsFullscreen(false)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <X className="h-4 w-4" /> <span className="hidden sm:inline">Close</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Maximize className="h-4 w-4" /> <span className="hidden sm:inline">Fullscreen</span>
                </button>
              )}
            </div>
          </div>
          <div className={`${isFullscreen ? 'flex-1 w-full h-full' : 'h-[600px] w-full'} bg-gray-100 relative`}>
            {['pdf'].includes(resource.fileType?.toLowerCase()) ? (
              isMobile && resource?.fileUrl ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(resource.fileUrl)}&embedded=true`}
                    className="w-full h-full border-0 absolute inset-0"
                    title={resource.title}
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <a href={inlineViewUrl} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md">
                      <Share2 className="h-4 w-4" /><span>Open Native Viewer</span>
                    </a>
                  </div>
                </div>
              ) : pdfLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-sm font-medium">Loading document preview...</p>
                </div>
              ) : pdfBlobUrl ? (
                <iframe
                  src={pdfBlobUrl}
                  className="w-full h-full border-0"
                  title={resource.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                  <FileText className="h-16 w-16 text-gray-300" />
                  <p className="text-lg font-medium">Could not load preview.</p>
                  <a href={inlineViewUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    <Share2 className="h-5 w-5" /><span>Open PDF in New Tab</span>
                  </a>
                </div>
              )
            ) : (['png', 'jpg', 'jpeg'].includes(resource.fileType?.toLowerCase()) ? (
              <img src={inlineViewUrl} alt={resource.title} className="w-full h-full object-contain" />
            ) : (
              <iframe src={inlineViewUrl} className="w-full h-full border-0" title="Resource Preview" />
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-5 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              User Comments & Reviews ({resource.ratings?.filter(r => r.comment).length || 0})
            </h3>
          </div>
          <div className="p-6">
            {(!resource.ratings || resource.ratings.length === 0 || !resource.ratings.some(r => r.comment)) ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No comments yet. Be the first to review this resource!</p>
                <button onClick={() => setRatingModal({ isOpen: true, rating: 0, comment: '' })} className="text-blue-600 font-medium hover:underline">
                  Write a review
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {resource.ratings.filter(r => r.comment).map((rating, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                      {rating.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900">{rating.user?.name || 'Anonymous User'}</h4>
                        <span className="text-xs text-gray-500">{new Date(rating.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < rating.rating ? 'fill-current text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-gray-700">{rating.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Rating Modal */}
      {ratingModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rate & Review "{resource.title}"</h3>
            
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingModal({ ...ratingModal, rating: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`h-10 w-10 ${ratingModal.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
                  />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave a Comment (Optional)
              </label>
              <textarea
                value={ratingModal.comment}
                onChange={(e) => setRatingModal({ ...ratingModal, comment: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows="4"
                placeholder="What did you think about this resource?"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRatingModal({ isOpen: false, rating: 0, comment: '' })}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
