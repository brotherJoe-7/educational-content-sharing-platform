import Link from 'next/link';
import { FileText, BookOpen, ArrowLeft } from 'lucide-react';

export default function License() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <BookOpen className="h-8 w-8 text-blue-600 cursor-pointer" />
              </Link>
              <span className="ml-2 text-xl font-bold text-gray-800">EduShare Sierra Leone</span>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">MIT License</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Copyright (c) 2024 EduShare Sierra Leone
            </p>

            <p className="text-gray-600 mb-4">
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>

            <p className="text-gray-600 mb-4">
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>

            <p className="text-gray-600 mb-4">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.
            </p>

            <div className="mt-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-3">Why MIT License?</h2>
              <p className="text-green-700 mb-3">
                The MIT License was chosen for EduShare Sierra Leone because:
              </p>
              <ul className="list-disc pl-6 text-green-700 space-y-2">
                <li><strong>Permissive:</strong> Allows maximum freedom for use, modification, and distribution</li>
                <li><strong>Simple:</strong> Easy to understand and comply with</li>
                <li><strong>Compatible:</strong> Works well with other open-source licenses</li>
                <li><strong>Educational Focus:</strong> Aligns with our mission of open educational resource sharing</li>
                <li><strong>Low Barrier:</strong> Encourages adoption and contribution from the community</li>
              </ul>
            </div>

            <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Content Licensing</h2>
              <p className="text-blue-700 mb-3">
                While the software is MIT-licensed, educational content shared on the platform uses various open licenses:
              </p>
              <ul className="list-disc pl-6 text-blue-700 space-y-2">
                <li><strong>Creative Commons BY:</strong> Attribution required</li>
                <li><strong>Creative Commons BY-SA:</strong> Attribution and share-alike required</li>
                <li><strong>Creative Commons BY-NC:</strong> Attribution required, non-commercial use only</li>
                <li><strong>OER (Open Educational Resources):</strong> Various open licenses for educational use</li>
                <li><strong>Public Domain:</strong> No restrictions on use</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
