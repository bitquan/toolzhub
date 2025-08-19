import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { BlogCard } from '@/components/Blog/BlogCard';
import { SEO } from '@/components/SEO/SEO';
import { useBlog } from '@/hooks/useBlog';

const BlogPage: React.FC = () => {
  const { posts, categories, loading, fetchPosts } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(posts);

  useEffect(() => {
    setFilteredPosts(
      posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = !selectedCategory || post.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      })
    );
  }, [posts, searchTerm, selectedCategory]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Blog - ToolzHub"
        description="Discover tips, tutorials, and insights about QR codes, digital tools, and business automation. Stay updated with the latest trends in digital marketing and technology."
        keywords="QR code tips, digital marketing, business tools, technology blog, automation tutorials"
        url="https://toolzhub-5014-31157.web.app/blog"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                ToolzHub Blog
              </h1>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Discover tips, tutorials, and insights about QR codes, digital tools, and business automation
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-gray-500" />
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Posts */}
          {!searchTerm && !selectedCategory && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.filter(post => post.featured).slice(0, 3).map((post) => (
                  <BlogCard key={post.id} post={post} featured />
                ))}
              </div>
            </div>
          )}

          {/* All Posts */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {searchTerm || selectedCategory ? 'Search Results' : 'Latest Articles'}
            </h2>
            
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No articles found.</p>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                    }}
                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {filteredPosts.length >= 10 && (
            <div className="text-center mt-12">
              <button
                onClick={() => fetchPosts(selectedCategory, posts.length + 10)}
                className="btn-primary"
              >
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
