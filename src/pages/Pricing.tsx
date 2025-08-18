import { Check, Crown } from 'lucide-react';

export function Pricing() {
  const features = {
    free: [
      '5 QR codes per month',
      'Basic QR code types',
      'PNG downloads',
      'Standard resolution',
      'Basic customization',
      'Community support',
    ],
    pro: [
      'Unlimited QR codes',
      'All QR code types',
      'PNG, SVG, PDF downloads',
      'High resolution up to 2000px',
      'Advanced customization',
      'Custom logo embedding',
      'Custom colors & branding',
      'Analytics & tracking',
      'Short URL generation',
      'Scan statistics',
      'Geographic insights',
      'Priority support',
      'API access',
      'White-label options',
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start for free and upgrade when you need more. No hidden fees, no complex tiers.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="card p-8 relative">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <p className="text-gray-600">Perfect for personal use and trying out our service</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button className="w-full btn-outline py-3 text-lg">
              Get Started Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="card p-8 relative border-primary-200 bg-primary-50">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                Most Popular
              </span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-gray-900">$2.99</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <p className="text-gray-600">Everything you need for professional QR code management</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button className="w-full btn-primary py-3 text-lg">
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have access 
                to Pro features until the end of your current billing period.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my QR codes if I downgrade?
              </h3>
              <p className="text-gray-600">
                Your existing QR codes will continue to work. However, you'll be limited to creating 
                5 new QR codes per month and won't have access to Pro features like analytics and custom branding.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do QR codes expire?
              </h3>
              <p className="text-gray-600">
                No, QR codes generated with Toolz.space never expire and will continue to work indefinitely, 
                regardless of your subscription status.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial for Pro features?
              </h3>
              <p className="text-gray-600">
                We don't offer a traditional free trial, but our free plan gives you access to basic QR code 
                generation so you can try our service before upgrading.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal 
                through our secure payment processor, Stripe.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I get a refund?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you're not satisfied with our Pro plan 
                within the first 30 days, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-primary-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using Toolz.space for their QR code needs. 
              Start free and upgrade when you're ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                Start Free
              </button>
              <button className="border border-primary-400 text-white hover:bg-primary-700 font-semibold py-3 px-8 rounded-lg transition-colors">
                View Features
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}