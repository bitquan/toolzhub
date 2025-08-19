import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import { SEO } from '@/components/SEO/SEO';
import { BlogCard } from '@/components/Blog/BlogCard';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost } from '@/types/blog';
import { debugLog } from '@/utils/debug';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, posts } = useBlog();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  debugLog.blogPost('Component render', {
    slug,
    loading,
    post: post ? 'exists' : 'null',
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        debugLog.blogPost('No slug provided');
        return;
      }

      debugLog.blogPost('Starting fetch for slug', slug);
      setLoading(true);

      try {
        const postData = await getPostBySlug(slug);
        debugLog.blogPost(
          'Post data received',
          postData ? 'Found' : 'Not found'
        );
        debugLog.blogPost('Post details', postData);

        setPost(postData);
      } catch (error) {
        debugLog.error('Error fetching post', error);
      }

      debugLog.blogPost('Setting loading to false');
      setLoading(false);
    };

    fetchPost();
    // getPostBySlug is stable from useBlog; include it for correctness
  }, [slug, getPostBySlug]);

  // Separate effect for related posts
  useEffect(() => {
    if (post && posts.length > 0) {
      debugLog.blogPost('Finding related posts for category', post.category);
      const related = posts
        .filter((p) => p.id !== post.id && p.category === post.category)
        .slice(0, 3);
      debugLog.blogPost('Related posts found', related.length);
      setRelatedPosts(related);
    }
  }, [post, posts]);

  const formatDate = (dateString: any) => {
    // Handle Firebase Timestamp
    if (dateString && typeof dateString.toDate === 'function') {
      return dateString.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    // Handle regular date string
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    debugLog.blogPost('Rendering loading state');
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    debugLog.blogPost('Rendering post not found state');
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link to="/blog" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  debugLog.blogPost('Rendering post successfully', post.title);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.imageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'ToolzHub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://toolzhub-5014-31157.web.app/logo.png',
      },
    },
  };

  return (
    <>
      <SEO
        title={post.seo?.title || post.title}
        description={post.seo?.description || post.excerpt}
        keywords={post.seo?.keywords || post.tags.join(', ')}
        image={post.imageUrl}
        url={`https://toolzhub-5014-31157.web.app/blog/${post.slug}`}
        type="article"
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        author={post.author}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link
            to="/blog"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {post.imageUrl && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium">
                  {post.category}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {post.author}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {post.readTime} min read
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center hover:text-primary-600 transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </button>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>

              {/* Content */}
              <div className="prose prose-lg max-w-none mb-8">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center flex-wrap gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPostPage;
