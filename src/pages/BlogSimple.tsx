import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Star,
} from 'lucide-react';
import { BlogCard } from '@/components/Blog/BlogCard';
import { SEO } from '@/components/SEO/SEO';
import { useBlog } from '@/hooks/useBlog';
import type { BlogCategory } from '@/types/blog';

const BlogPage: React.FC = () => {
  const { posts, categories, loading } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Debug logging to see what posts are being loaded
  console.log('🌐 BLOG PAGE: Posts loaded:', posts.length);
  console.log(
    '📝 BLOG PAGE: Post details:',
    posts.map((p) => ({ id: p.id, title: p.title, author: p.author }))
  );

  // Use useMemo to avoid unnecessary recalculations
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === '' || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const formatDate = (dateString: any) => {
    if (dateString && typeof dateString.toDate === 'function') {
      return dateString.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <SEO
          title="Blog - QR Code Tips, Tutorials & Industry Insights"
          description="Discover the latest QR code trends, tutorials, and business insights. Learn how to create effective QR code campaigns and stay ahead in digital marketing."
          keywords="QR codes blog, QR code tutorials, digital marketing, QR code tips, business growth"
        />

        {/* Loading Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-6"></div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Loading <span className="text-yellow-300">QR Insights</span>
              </h1>
              <p className="text-xl text-blue-100">
                Preparing the latest QR code knowledge for you...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const featuredPosts = filteredPosts.filter((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SEO
        title="Blog - QR Code Tips, Tutorials & Industry Insights"
        description="Discover the latest QR code trends, tutorials, and business insights. Learn how to create effective QR code campaigns and stay ahead in digital marketing."
        keywords="QR codes blog, QR code tutorials, digital marketing, QR code tips, business growth"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-blue-100">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">Expert Knowledge Hub</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              QR Code <span className="text-yellow-300">Mastery</span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform your business with cutting-edge QR code strategies,
              expert tutorials, and industry insights that deliver measurable
              results
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-blue-200">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Industry Experts</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Proven Strategies</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>Actionable Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-16 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <input
                  type="text"
                  placeholder="Search tutorials, tips, case studies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-72">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none bg-white transition-all cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((category: BlogCategory) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((category: BlogCategory) => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.name)}
                className={`px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-12">
          <p className="text-gray-600 text-xl">
            {searchTerm || selectedCategory ? (
              <>
                <span className="font-semibold text-blue-600">
                  {filteredPosts.length}
                </span>{' '}
                results found
                {searchTerm && (
                  <span className="ml-1">
                    for "<span className="font-medium">{searchTerm}</span>"
                  </span>
                )}
                {selectedCategory && (
                  <span className="ml-1">
                    in <span className="font-medium">{selectedCategory}</span>
                  </span>
                )}
              </>
            ) : (
              <>
                Explore{' '}
                <span className="font-semibold text-blue-600">
                  {posts.length}
                </span>{' '}
                expert articles
              </>
            )}
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && !searchTerm && !selectedCategory && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <Star className="h-8 w-8 text-yellow-500" />
              <h2 className="text-4xl font-bold text-gray-900">
                Featured Articles
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {featuredPosts.slice(0, 2).map((post) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {post.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                        {post.category}
                      </span>
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-8 line-clamp-3 text-lg leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime} min read</span>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-blue-600 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-10">
              {featuredPosts.length > 0 && !searchTerm && !selectedCategory
                ? 'Latest Articles'
                : 'Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(featuredPosts.length > 0 && !searchTerm && !selectedCategory
                ? regularPosts
                : filteredPosts
              ).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-16 max-w-2xl mx-auto">
              <Search className="h-20 w-20 text-gray-300 mx-auto mb-8" />
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                No articles found
              </h3>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                {searchTerm || selectedCategory
                  ? "We couldn't find any articles matching your criteria. Try adjusting your search terms or exploring different categories."
                  : 'No blog posts are available at the moment. Check back soon for fresh insights and tutorials!'}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {filteredPosts.length > 0 && (
          <div className="mt-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              ></div>
            </div>

            <div className="relative">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Create Professional QR Codes?
              </h3>
              <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
                Transform your learning into action with our powerful QR code
                generator. Create stunning, trackable QR codes in seconds.
              </p>
              <a
                href="/generate"
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Creating QR Codes
                <ArrowRight className="h-6 w-6" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
