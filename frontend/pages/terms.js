import Link from 'next/link';
import { FileText, BookOpen, ArrowLeft } from 'lucide-react';

export default function Terms() {
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
              <span className="ml-2 text-xl font-bold text-gray-800">Open Content Sierra Leone</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: January 2026
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using Open Content Sierra Leone, you agree to be bound by these Terms of Use. 
              If you do not agree to these terms, please do not use this platform.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Eligibility</h2>
            <p className="text-gray-600 mb-4">
              You must be at least 13 years old to use this platform. By using this platform, you represent 
              that you are of legal age to form a binding contract with Open Content Sierra Leone.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials. You agree 
              to notify us immediately of any unauthorized use of your account. You are responsible for all 
              activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Content Guidelines</h2>
            <p className="text-gray-600 mb-4">
              Users agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Upload only educational content appropriate for Sierra Leone's educational system</li>
              <li>Ensure all content is properly licensed under open licenses (Creative Commons, OER, etc.)</li>
              <li>Not upload copyrighted material without proper authorization</li>
              <li>Not upload content that is illegal, harmful, or inappropriate</li>
              <li>Respect intellectual property rights of others</li>
              <li>Provide accurate metadata for all uploaded resources</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5. Content Moderation</h2>
            <p className="text-gray-600 mb-4">
              All uploaded content is subject to moderation before publication. Open Content Sierra Leone reserves 
              the right to approve, reject, or remove any content that violates these terms or is deemed 
              inappropriate. Users whose content is repeatedly rejected may have their accounts suspended.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              Users retain ownership of content they upload. By uploading content, users grant Open Content Sierra 
              Leone a non-exclusive, worldwide, royalty-free license to use, display, and distribute the content 
              for educational purposes. Users must ensure they have the right to upload and share the content.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7. Prohibited Activities</h2>
            <p className="text-gray-600 mb-4">
              Users agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Use the platform for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to the platform or user accounts</li>
              <li>Interfere with or disrupt the platform's operation</li>
              <li>Upload viruses, malware, or malicious code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8. Privacy</h2>
            <p className="text-gray-600 mb-4">
              Your use of this platform is also governed by our Privacy Policy. Please review our Privacy 
              Policy to understand how we collect, use, and protect your personal information.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9. Disclaimer of Warranties</h2>
            <p className="text-gray-600 mb-4">
              The platform is provided "as is" without warranties of any kind, either express or implied. 
              We do not guarantee that the platform will be uninterrupted, secure, or error-free.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              Open Content Sierra Leone shall not be liable for any indirect, incidental, special, or consequential 
              damages arising from the use or inability to use the platform.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">11. Content Availability</h2>
            <p className="text-gray-600 mb-4">
              We do not guarantee that content will be available at all times. We may remove or suspend access 
              to content for maintenance, updates, or other reasons without notice.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12. Termination</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to suspend or terminate your account at any time for violation of these terms 
              or for any other reason at our sole discretion.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13. Modifications to Terms</h2>
            <p className="text-gray-600 mb-4">
              We may modify these terms at any time. Continued use of the platform after modifications constitutes 
              acceptance of the updated terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">14. Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These terms are governed by the laws of Sierra Leone. Any disputes shall be resolved in the courts 
              of Sierra Leone.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">15. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For questions about these Terms of Use, please contact us through the platform.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-8">
              <p className="text-blue-800 font-medium">
                By using Open Content Sierra Leone, you agree to these Terms of Use and our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
