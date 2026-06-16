import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { AlertTriangle } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use the local pdf.js worker bundled with react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function MobilePdfViewer({ proxyUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [docLoading, setDocLoading] = useState(true);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setDocLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((err) => {
    console.error('react-pdf load error:', err);
    setLoadError(true);
    setDocLoading(false);
  }, []);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white px-6 text-center space-y-4 py-10">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Could not load PDF</h3>
        <p className="text-gray-500 text-sm">The document may be too large for direct preview.</p>
        <a
          href={proxyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
        >
          Open PDF Directly
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-gray-100">
      {/* Page controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10">
        <button
          onClick={() => setPageNumber(p => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg text-sm font-medium"
        >
          ← Prev
        </button>
        <span className="text-sm font-medium text-gray-700">
          {docLoading ? 'Loading…' : `Page ${pageNumber} of ${numPages}`}
        </span>
        <button
          onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
          disabled={!numPages || pageNumber >= numPages}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg text-sm font-medium"
        >
          Next →
        </button>
      </div>

      {/* PDF Render */}
      <div className="flex justify-center overflow-auto flex-1 p-2">
        {docLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-500 font-medium">Loading document…</p>
          </div>
        )}
        <Document
          file={proxyUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="w-full"
        >
          <Page
            pageNumber={pageNumber}
            width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 24, 720) : 360}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>

      {/* Bottom navigation for quick jump */}
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-3 bg-white border-t border-gray-200 flex-wrap px-4">
          {Array.from({ length: numPages }, (_, i) => i + 1).map(pg => (
            <button
              key={pg}
              onClick={() => setPageNumber(pg)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                pg === pageNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {pg}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
