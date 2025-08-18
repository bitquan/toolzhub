import { Link } from 'react-router-dom';
import { QrCode, Zap, Shield, BarChart3, Smartphone, Globe, Wifi, User, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional QR Code Generator
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create, customize, and track QR codes for your business. From simple URLs to complex vCards, 
              generate professional QR codes with advanced analytics and customization options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/generate" className="btn-primary text-lg px-8 py-4">
                Start Creating QR Codes
              </Link>
              <Link to="/pricing" className="btn-outline text-lg px-8 py-4">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for QR Codes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to create, customize, and track your QR codes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Generate QR codes instantly with our optimized engine. No waiting, no delays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is encrypted and secure. We never store sensitive information.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Track scans, analyze performance, and understand your audience with detailed insights.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Optimized</h3>
              <p className="text-gray-600">
                Perfect experience on all devices. Create and manage QR codes anywhere.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Formats</h3>
              <p className="text-gray-600">
                Download in PNG, SVG, or PDF formats. Perfect for print and digital use.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Branding</h3>
              <p className="text-gray-600">
                Add your logo, customize colors, and make QR codes match your brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Types Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Support for All QR Code Types
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create QR codes for any purpose with our comprehensive type support
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: Globe, label: 'Website URLs', description: 'Direct links to websites' },
              { icon: Wifi, label: 'WiFi Networks', description: 'Share WiFi credentials' },
              { icon: User, label: 'Contact Cards', description: 'vCard contact information' },
              { icon: MessageSquare, label: 'SMS Messages', description: 'Pre-filled text messages' },
              { icon: Mail, label: 'Email', description: 'Email with subject and body' },
              { icon: Phone, label: 'Phone Numbers', description: 'Direct dial phone numbers' },
              { icon: MessageSquare, label: 'WhatsApp', description: 'WhatsApp messages' },
              { icon: MapPin, label: 'Locations', description: 'GPS coordinates' },
              { icon: QrCode, label: 'Plain Text', description: 'Any text content' },
            ].map((type, index) => (
              <div key={index} className="card p-4 text-center hover:shadow-md transition-shadow">
                <type.icon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">{type.label}</h3>
                <p className="text-xs text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Create Professional QR Codes?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Toolz.space for their QR code needs. 
            Start with our free tier or upgrade for advanced features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Get Started Free
            </Link>
            <Link to="/pricing" className="btn-outline text-lg px-8 py-4">
              View Pricing Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}