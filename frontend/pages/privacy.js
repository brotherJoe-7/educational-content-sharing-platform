import Link from 'next/link';
import { Shield, BookOpen, ArrowLeft } from 'lucide-react';

export default function Privacy() {
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
            <Shield className="h-10 w-10 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: January 2024
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              EduShare Sierra Leone ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our educational content sharing platform.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect only the minimum information necessary to provide our services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Name:</strong> Required for account identification</li>
              <li><strong>Email:</strong> Required for account creation and communication</li>
              <li><strong>Password:</strong> Encrypted and stored securely using bcrypt hashing</li>
              <li><strong>Uploaded Resources:</strong> Educational content you choose to share</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use your information solely for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Providing and maintaining our platform</li>
              <li>Authenticating your account</li>
              <li>Managing uploaded resources</li>
              <li>Communicating important updates</li>
              <li>Ensuring compliance with our terms of service</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Passwords are hashed using bcrypt before storage</li>
              <li>JWT tokens are used for secure session management</li>
              <li>All data is transmitted over HTTPS</li>
              <li>Rate limiting prevents brute-force attacks</li>
              <li>Helmet middleware provides additional security headers</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5. Data Minimization</h2>
            <p className="text-gray-600 mb-4">
              Following data minimization principles, we:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Collect only essential information</li>
              <li>Do not collect unnecessary personal data</li>
              <li>Do not track user behavior beyond what's necessary</li>
              <li>Do not sell or share data with third parties</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6. Content Moderation</h2>
            <p className="text-gray-600 mb-4">
              All uploaded resources undergo moderation before being published. This ensures:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Content complies with educational standards</li>
              <li>Materials are appropriately licensed</li>
              <li>No inappropriate or illegal content is distributed</li>
              <li>Full audit trail is maintained for compliance</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Access your personal data</li>
              <li>Request deletion of your account and data</li>
              <li>Update your information</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8. Children's Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our platform is designed for educational use. We do not knowingly collect information from children under 13 without parental consent.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify users of significant changes via email or platform notifications.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about this Privacy Policy, please contact us through our platform or via email.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-8">
              <p className="text-blue-800 font-medium">
                By using EduShare Sierra Leone, you agree to this Privacy Policy and our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
