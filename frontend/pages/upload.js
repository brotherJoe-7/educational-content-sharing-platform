import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Upload as UploadIcon, ArrowLeft, BookOpen, FileText, CheckCircle, AlertCircle, PenLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dynamic from 'next/dynamic';

// Load Quill editor client-side only (no SSR — window is required)
const ReactQuill = dynamic(
  () => import('react-quill'),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-xl p-4 min-h-[280px] bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Loading editor…
      </div>
    )
  }
);

export default function Upload() {
  const router = useRouter();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState('file'); // 'file' | 'article'
  const [articleContent, setArticleContent] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  // Submit file upload
  const onSubmitFile = async (data) => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('subject', data.subject);
      formData.append('gradeLevel', data.gradeLevel);
      formData.append('author', data.author);
      formData.append('licenseType', data.licenseType);

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Resource uploaded! Pending admin approval.');
        setFile(null);
        reset();
        router.push('/resources');
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit article
  const onSubmitArticle = async (data) => {
    const stripped = articleContent.replace(/<[^>]+>/g, '').trim();
    if (!stripped) {
      toast.error('Please write some article content');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/article`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          subject: data.subject,
          gradeLevel: data.gradeLevel,
          author: data.author,
          licenseType: data.licenseType,
          articleContent
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Article submitted! Pending admin approval.');
        setArticleContent('');
        reset();
        router.push('/resources');
      } else {
        toast.error(result.message || 'Submission failed');
      }
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ]
  };

  const SharedFields = ({ reg, errs }) => (
    <>
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
        <input
          {...reg('title', { required: 'Title is required' })}
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Enter a descriptive title"
        />
        {errs.title && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errs.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description *</label>
        <textarea
          {...reg('description', { required: 'Description is required' })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          placeholder="A brief summary of the content"
        />
        {errs.description && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errs.description.message}</p>}
      </div>

      {/* Subject & Grade */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
          <select {...reg('subject', { required: 'Subject is required' })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
            <option value="">Select subject</option>
            {['Mathematics','English','Science','Social Studies','Physics','Chemistry','Biology','History','Geography','Other'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errs.subject && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errs.subject.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Grade Level *</label>
          <select {...reg('gradeLevel', { required: 'Grade level is required' })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
            <option value="">Select grade level</option>
            {['Primary 1-3','Primary 4-6','JSS 1-3','SSS 1-3','University','Other'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {errs.gradeLevel && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errs.gradeLevel.message}</p>}
        </div>
      </div>

      {/* Author & License */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Author *</label>
          <input
            {...reg('author', { required: 'Author is required' })}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Author or creator name"
          />
          {errs.author && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errs.author.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">License Type *</label>
          <select {...reg('licenseType', { required: 'License type is required' })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
            <option value="">Select license</option>
            {['Creative Commons BY','Creative Commons BY-SA','Creative Commons BY-NC','OER','Public Domain','Other'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {errs.licenseType && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errs.licenseType.message}</p>}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link href="/resources" className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-base sm:text-xl font-bold text-gray-800">Open Content<span className="hidden sm:inline"> Sierra Leone</span></span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/resources" className="flex items-center space-x-1.5 sm:space-x-2 text-gray-600 hover:text-blue-600 px-3 sm:px-4 py-2 rounded-xl font-medium transition-colors text-sm">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Resources</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Share Educational Content</h1>
          <p className="text-gray-600 text-sm sm:text-base">Upload a document or write an article to share with the Sierra Leone community</p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-6 gap-1">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              mode === 'file' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UploadIcon className="h-4 w-4" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('article')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              mode === 'article' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <PenLine className="h-4 w-4" />
            Write Article
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-5 sm:p-8">

          {/* FILE UPLOAD MODE */}
          {mode === 'file' && (
            <form onSubmit={handleSubmit(onSubmitFile)} className="space-y-6">
              {/* File Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center transition-all ${
                  dragActive ? 'border-blue-500 bg-blue-50' : file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-green-100 p-4 rounded-full mb-4"><CheckCircle className="h-8 w-8 text-green-600" /></div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">{file.name}</p>
                    <p className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium">Remove file</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-100 p-4 rounded-full mb-4"><UploadIcon className="h-8 w-8 text-blue-600" /></div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Drag and drop your file here</p>
                    <p className="text-gray-600 mb-4">or click to browse</p>
                    <p className="text-sm text-gray-500">Accepted: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG (Max 10MB)</p>
                  </div>
                )}
              </div>

              <SharedFields reg={register} errs={errors} />

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Upload Guidelines</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Preferred format: PDF</li>
                      <li>• Ensure you have the right to share this content</li>
                      <li>• Content will be reviewed before publication</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 font-semibold text-lg">
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /><span>Uploading...</span></> : <><UploadIcon className="h-5 w-5" /><span>Upload Resource</span></>}
              </button>
            </form>
          )}

          {/* ARTICLE WRITE MODE */}
          {mode === 'article' && (
            <form onSubmit={handleSubmit(onSubmitArticle)} className="space-y-6">
              <SharedFields reg={register} errs={errors} />

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Article Content *</label>
                <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                  <style>{`.ql-toolbar { border: none !important; border-bottom: 1px solid #e5e7eb !important; background: #f9fafb; } .ql-container { border: none !important; font-size: 15px; min-height: 280px; }`}</style>
                  <ReactQuill
                    theme="snow"
                    value={articleContent}
                    onChange={setArticleContent}
                    modules={quillModules}
                    placeholder="Write your article, notes, or journal entry here..."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">You can use headings, bold, lists, links, and more using the toolbar above.</p>
              </div>

              {/* Guidelines */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start">
                  <PenLine className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">Article Guidelines</p>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Write clear, accurate, and educational content</li>
                      <li>• Cite your sources where applicable</li>
                      <li>• Articles are reviewed by admin before going live</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg disabled:opacity-50 font-semibold text-lg">
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /><span>Submitting...</span></> : <><PenLine className="h-5 w-5" /><span>Submit Article</span></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
