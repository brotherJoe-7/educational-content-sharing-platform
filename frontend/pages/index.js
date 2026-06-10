import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BookOpen, Upload, Search, Shield } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" aria-hidden="true" />
              <span className="ml-2 text-xl font-bold text-gray-800">EduShare Sierra Leone</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Share Educational Resources in Sierra Leone
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A legal and ethical platform for sharing open educational resources. 
            Access past papers, notes, tutorials, and more.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Upload className="h-5 w-5 mr-2" aria-hidden="true" />
              Get Started
            </Link>
            <Link href="/resources" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 border-2 border-blue-600 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Search className="h-5 w-5 mr-2" aria-hidden="true" />
              Browse Resources
            </Link>
          </div>
        </div>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-8 mt-16" aria-label="Platform features">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Resources</h3>
            <p className="text-gray-600">Share PDFs, notes, past papers, and tutorials with the community.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Search & Discover</h3>
            <p className="text-gray-600">Find resources by subject, grade level, or keyword.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Legal & Ethical</h3>
            <p className="text-gray-600">All content is moderated and licensed under open licenses.</p>
          </div>
        </section>

        {/* License Info */}
        <section className="mt-16 bg-white p-8 rounded-xl shadow-md" aria-labelledby="license-heading">
          <div className="flex items-start">
            <Shield className="h-8 w-8 text-green-600 mt-1 mr-4" aria-hidden="true" />
            <div>
              <h3 id="license-heading" className="text-xl font-semibold mb-2">Open & Licensed Content</h3>
              <p className="text-gray-600 mb-4">
                All resources shared on this platform are licensed under open licenses such as Creative Commons 
                and OER (Open Educational Resources). This ensures legal sharing and promotes educational access 
                across Sierra Leone.
              </p>
              <Link href="/privacy" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                Learn about our privacy policy →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 EduShare Sierra Leone. Licensed under MIT License.</p>
          <nav className="mt-4 space-x-4" aria-label="Footer navigation">
            <Link href="/privacy" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">Privacy Policy</Link>
            <Link href="/license" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">License</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">Terms of Use</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
