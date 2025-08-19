import { BlogManager } from '@/components/Admin/BlogManager';
import { Header } from '@/components/Common/Header';
import { Footer } from '@/components/Common/Footer';

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your blog posts and website content</p>
          </div>
          <BlogManager />
        </div>
      </main>
      <Footer />
    </div>
  );
}
