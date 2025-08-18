import { Link } from 'react-router-dom';
import { QrCode, Twitter, Github, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Toolz.space</span>
            </Link>
            <p className="text-gray-600 text-sm">
              Professional QR code generator with customization options and analytics.
              Create QR codes for your business needs.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/toolzspace"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/bitquan/toolzhub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@toolz.space"
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/generate" className="text-gray-600 hover:text-primary-600 transition-colors">
                  QR Generator
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/api" className="text-gray-600 hover:text-primary-600 transition-colors">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="/status" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Status Page
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="/gdpr" className="text-gray-600 hover:text-primary-600 transition-colors">
                  GDPR Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <a href="/privacy" className="text-gray-400 hover:text-gray-500 text-sm">
              Privacy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-gray-500 text-sm">
              Terms
            </a>
          </div>
          <p className="mt-8 text-gray-400 text-sm md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} Toolz.space. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}