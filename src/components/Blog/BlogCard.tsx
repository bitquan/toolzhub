import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const formatDate = (dateString: any) => {
    // Handle Firebase Timestamp
    if (dateString && typeof dateString.toDate === 'function') {
      return dateString.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Handle regular date string
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (featured) {
    return (
      <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {post.imageUrl && (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-md text-xs font-medium">
              {post.category}
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {post.readTime} min read
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-1" />
              {post.author}
            </div>
            
            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              Read More
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.imageUrl && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-32 object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
          <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
            {post.category}
          </span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link to={`/blog/${post.slug}`} className="hover:text-primary-600">
            {post.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{post.author}</span>
          <span>{post.readTime} min read</span>
        </div>
      </div>
    </article>
  );
};
