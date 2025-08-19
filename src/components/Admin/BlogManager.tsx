import { useState } from 'react';
import { useAdminData } from '@/contexts/AdminDataContext';
import { DeleteConfirmation } from '@/components/Common/DeleteConfirmation';
import { BlogPopulator } from './BlogPopulator';
import {
  Trash2,
  Edit,
  Eye,
  Calendar,
  Tag,
  User,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function BlogManager() {
  const {
    blogPosts: posts,
    blogLoading: loading,
    deleteBlogPost,
    refreshBlogPosts,
  } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDeleteClick = (postId: string, title: string) => {
    setDeleteConfirm({ id: postId, title });
  };

  const handleDeleteConfirm = async () => {
    console.log('🗑️ Delete confirmation triggered');
    if (!deleteConfirm) {
      console.log('❌ No deleteConfirm object found');
      return;
    }

    console.log('🔄 Starting deletion process for:', deleteConfirm);
    setIsDeleting(true);
    try {
      console.log('📞 Calling deleteBlogPost with ID:', deleteConfirm.id);
      const success = await deleteBlogPost(deleteConfirm.id);
      console.log('✅ Delete result:', success);

      if (success) {
        toast.success(`"${deleteConfirm.title}" deleted successfully`);
        setDeleteConfirm(null);
        console.log('🔄 Refreshing blog posts...');
        // Refresh the blog posts list
        await refreshBlogPosts();
        console.log('✅ Blog posts refreshed');
      } else {
        console.log('❌ Delete failed');
        toast.error('Failed to delete post - please check permissions');
      }
    } catch (error) {
      console.error('💥 Error in handleDeleteConfirm:', error);
      toast.error('Error deleting post');
    } finally {
      console.log('🏁 Setting isDeleting to false');
      setIsDeleting(false);
    }
  };

  // Function to clear old hardcoded blog posts
  const clearOldPosts = async () => {
    console.log('🚀 CLEAR OLD POSTS: Function called');
    console.log('📊 CLEAR OLD POSTS: Current posts count:', posts.length);
    console.log(
      '📋 CLEAR OLD POSTS: All current posts:',
      posts.map((p) => ({ id: p.id, title: p.title, slug: p.slug }))
    );

    const oldPostSlugs = [
      'qr-codes-for-business',
      'qr-code-types-guide',
      'qr-codes-business-marketing-2024',
      'creative-qr-code-marketing-ideas-2024',
      'qr-code-analytics-guide-2024',
      'how-qr-codes-are-revolutionizing-business-marketing-in-2025',
      'complete-guide-qr-code-types-2024',
      'tgg',
    ];

    const oldPostIds = [
      'how-qr-codes-are-revolutionizing-business-marketing-in-2025',
      'complete-guide-qr-code-types-2024',
      'tgg',
      // Add the actual IDs we found in the console
      'OpIlc6VSwsoaoVntoWoW', // "Tgg"
      '96tbeMM6Fq9lngjnraHo', // "How QR Codes Are Revolutionizing Business Marketing in 2025"
    ];

    const oldPostTitles = [
      'How QR Codes Can Transform Your Business Marketing',
      'Complete Guide to QR Code Types and Use Cases',
      'How QR Codes Are Revolutionizing Business Marketing in 2024',
      'How QR Codes Are Revolutionizing Business Marketing in 2025',
      'The Complete Guide to QR Code Types: Choose the Right One for Your Needs',
      'Tgg',
    ];

    console.log('🔍 CLEAR OLD POSTS: Looking for slugs:', oldPostSlugs);
    console.log('🔍 CLEAR OLD POSTS: Looking for IDs:', oldPostIds);
    console.log('🔍 CLEAR OLD POSTS: Looking for titles:', oldPostTitles);

    // Find old posts by checking titles and slugs - be more aggressive
    const oldPosts = posts.filter((post) => {
      // Check if ID or slug matches any of the old ones
      const idMatch = oldPostIds.includes(post.id);
      const slugMatch = oldPostSlugs.includes(post.slug);

      // Check if title contains any of the old keywords
      const titleMatch = oldPostTitles.some(
        (title) =>
          post.title.includes(title) ||
          post.title.includes('How QR Codes Can Transform') ||
          post.title.includes('Complete Guide to QR Code Types') ||
          post.title.includes('Revolutionizing Business Marketing') ||
          post.title.includes('How QR Codes Are Revolutionizing')
      );

      // Also check for specific authors that indicate old posts
      const authorMatch =
        post.author === 'Sayquan Mclaurin' ||
        post.author === 'ToolzHub Technical Team';

      // Also check for short, simple titles that look like old hardcoded posts
      const isShortSimpleTitle =
        (post.title.length < 100 &&
          (post.title.includes('QR Code') ||
            post.title.includes('QR Codes'))) ||
        post.title === 'Tgg';

      console.log(
        `🔍 Checking post "${post.title}" (ID: ${post.id}): idMatch=${idMatch}, slugMatch=${slugMatch}, titleMatch=${titleMatch}, authorMatch=${authorMatch}, isShort=${isShortSimpleTitle}`
      );

      return (
        idMatch || slugMatch || titleMatch || authorMatch || isShortSimpleTitle
      );
    });

    console.log('📦 CLEAR OLD POSTS: Found old posts:', oldPosts.length);
    console.log(
      '📝 CLEAR OLD POSTS: Old posts details:',
      oldPosts.map((p) => ({ id: p.id, title: p.title, slug: p.slug }))
    );

    if (oldPosts.length === 0) {
      console.log('ℹ️ CLEAR OLD POSTS: No old posts found');
      toast('No old posts found to remove');
      return;
    }

    console.log('❓ CLEAR OLD POSTS: Asking for confirmation...');
    const confirmDelete = window.confirm(
      `Found ${oldPosts.length} old blog posts. Are you sure you want to delete them?\n\n` +
        oldPosts.map((post) => `• ${post.title}`).join('\n')
    );

    if (!confirmDelete) {
      console.log('❌ CLEAR OLD POSTS: User cancelled deletion');
      return;
    }

    console.log(
      '✅ CLEAR OLD POSTS: User confirmed deletion, starting process...'
    );
    setIsDeleting(true);
    let deletedCount = 0;

    try {
      for (const post of oldPosts) {
        console.log(
          `🗑️ CLEAR OLD POSTS: Deleting post ID: ${post.id}, Title: ${post.title}`
        );
        const success = await deleteBlogPost(post.id);
        console.log(
          `📊 CLEAR OLD POSTS: Delete result for ${post.id}:`,
          success
        );
        if (success) {
          deletedCount++;
        }
      }

      console.log(
        `📊 CLEAR OLD POSTS: Deletion complete. Deleted ${deletedCount}/${oldPosts.length} posts`
      );

      if (deletedCount > 0) {
        console.log('✅ CLEAR OLD POSTS: Success! Refreshing blog posts...');
        toast.success(`Successfully deleted ${deletedCount} old blog posts`);
        await refreshBlogPosts();
        console.log('🔄 CLEAR OLD POSTS: Blog posts refreshed');
      } else {
        console.log('❌ CLEAR OLD POSTS: No posts were actually deleted');
        toast.error('Failed to delete old posts');
      }
    } catch (error) {
      console.error('💥 CLEAR OLD POSTS: Error during deletion:', error);
      toast.error('Error occurred while deleting old posts');
    } finally {
      console.log(
        '🏁 CLEAR OLD POSTS: Process finished, setting isDeleting to false'
      );
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: any) => {
    if (dateString && typeof dateString.toDate === 'function') {
      return dateString.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    if (status === 'published') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const categories = [...new Set(posts.map((post) => post.category))];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
          {posts.length > 0 && (
            <button
              onClick={() => {
                console.log(
                  '🔴 BUTTON CLICKED: Clear Old Posts button clicked'
                );
                alert('Button clicked! Check console for detailed logs.');
                clearOldPosts();
              }}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Clearing...' : 'Clear Old Posts'}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {posts.length}
            </div>
            <div className="text-sm text-blue-600">Total Posts</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {posts.filter((p) => p.status === 'published').length}
            </div>
            <div className="text-sm text-green-600">Published</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {posts.filter((p) => p.status === 'draft').length}
            </div>
            <div className="text-sm text-yellow-600">Drafts</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {posts.filter((p) => p.featured).length}
            </div>
            <div className="text-sm text-purple-600">Featured</div>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-8">
            {posts.length === 0 && !loading ? (
              // No posts at all - show populator
              <BlogPopulator />
            ) : (
              // Posts exist but none match filters
              <div className="text-center">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.imageUrl && (
                          <img
                            className="h-12 w-12 rounded-lg object-cover mr-4"
                            src={post.imageUrl}
                            alt=""
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {post.excerpt}
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <User className="h-3 w-3 mr-1" />
                            {post.author}
                            <Tag className="h-3 w-3 ml-3 mr-1" />
                            {post.readTime} min read
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(post.status || 'draft')}>
                        {post.status || 'draft'}
                      </span>
                      {post.featured && (
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(post.publishedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Post"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() =>
                            window.open(`/admin/edit-post/${post.id}`, '_blank')
                          }
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Edit Post"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(post.id, post.title)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteConfirm?.title}"`}
        message="Are you sure you want to delete this blog post? This will remove it from your website and cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
