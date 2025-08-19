import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit as firestoreLimit,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { BlogPost, BlogCategory } from '@/types/blog';
import { mockBlogPosts, mockBlogCategories } from '@/data/mockBlogData';
import { debugLog } from '@/utils/debug';

const USE_MOCK_DATA = false; // Toggle this to switch between mock and Firebase data

export const useBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (category?: string, limit = 10) => {
    if (USE_MOCK_DATA) {
      let filteredPosts = mockBlogPosts;
      if (category) {
        filteredPosts = mockBlogPosts.filter(
          (post) => post.category.toLowerCase() === category.toLowerCase()
        );
      }
      setPosts(filteredPosts.slice(0, limit));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let q = query(
        collection(db, 'blog'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        firestoreLimit(limit)
      );

      if (category) {
        q = query(
          collection(db, 'blog'),
          where('category', '==', category),
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc'),
          firestoreLimit(limit)
        );
      }

      const querySnapshot = await getDocs(q);
      const blogPosts: BlogPost[] = [];

      console.log(
        '🔥 FIREBASE: Query executed, docs found:',
        querySnapshot.size
      );

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 FIREBASE DOC:', {
          id: doc.id,
          title: data.title,
          author: data.author,
          publishedAt: data.publishedAt,
          createdAt: data.createdAt,
        });
        blogPosts.push({
          id: doc.id,
          ...data,
        } as BlogPost);
      });

      console.log('📝 FIREBASE: Total posts loaded:', blogPosts.length);

      // If no posts found in Firebase, use mock data as fallback
      if (blogPosts.length === 0) {
        console.log('No posts found in Firebase, using mock data as fallback');
        let filteredPosts = mockBlogPosts;
        if (category) {
          filteredPosts = mockBlogPosts.filter(
            (post) => post.category.toLowerCase() === category.toLowerCase()
          );
        }
        setPosts(filteredPosts.slice(0, limit));
      } else {
        console.log('📝 FIREBASE: Setting Firebase posts to state');
        setPosts(blogPosts);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts');
      // Fallback to mock data on error
      let filteredPosts = mockBlogPosts;
      if (category) {
        filteredPosts = mockBlogPosts.filter(
          (post) => post.category.toLowerCase() === category.toLowerCase()
        );
      }
      setPosts(filteredPosts.slice(0, limit));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = async () => {
    if (USE_MOCK_DATA) {
      setCategories(mockBlogCategories);
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, 'blog_categories'));
      const categoriesData = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as BlogCategory)
      );

      // If no categories found in Firebase, use mock data as fallback
      if (categoriesData.length === 0) {
        console.log(
          'No categories found in Firebase, using mock data as fallback'
        );
        setCategories(mockBlogCategories);
      } else {
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to mock data on error
      setCategories(mockBlogCategories);
    }
  };

  const getPostBySlug = useCallback(
    async (slug: string): Promise<BlogPost | null> => {
      debugLog.useBlog('getPostBySlug called with slug', slug);

      if (USE_MOCK_DATA) {
        debugLog.useBlog('Using mock data mode');
        const post = mockBlogPosts.find((post) => post.slug === slug);
        debugLog.useBlog('Mock post found', post ? 'Yes' : 'No');
        return post || null;
      }

      try {
        debugLog.useBlog('Querying Firebase for slug', slug);
        const q = query(
          collection(db, 'blog'),
          where('slug', '==', slug),
          where('status', '==', 'published'),
          firestoreLimit(1)
        );

        const snapshot = await getDocs(q);
        debugLog.useBlog('Firebase query completed. Empty?', snapshot.empty);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const postData = { id: doc.id, ...doc.data() } as BlogPost;
          debugLog.useBlog('Firebase post found', postData.title);
          return postData;
        }

        // Fallback to mock data if not found in Firebase
        debugLog.useBlog('Post not found in Firebase, checking mock data');
        const mockPost = mockBlogPosts.find((post) => post.slug === slug);
        debugLog.useBlog(
          'Mock fallback result',
          mockPost ? 'Found' : 'Not found'
        );
        return mockPost || null;
      } catch (err) {
        debugLog.error('Error fetching post', err);
        // Fallback to mock data on error
        const mockPost = mockBlogPosts.find((post) => post.slug === slug);
        debugLog.useBlog(
          'Error fallback to mock data',
          mockPost ? 'Found' : 'Not found'
        );
        return mockPost || null;
      }
    },
    []
  );

  const deletePost = useCallback(
    async (postId: string): Promise<boolean> => {
      debugLog.useBlog('Deleting post with ID', postId);

      try {
        // Delete from Firebase first
        await deleteDoc(doc(db, 'blog', postId));
        debugLog.useBlog('Post deleted from Firebase successfully', postId);

        // Update local state immediately
        setPosts((currentPosts) => {
          const filtered = currentPosts.filter((post) => post.id !== postId);
          debugLog.useBlog(
            'Local state updated, remaining posts:',
            filtered.length
          );
          return filtered;
        });

        // Force a fresh fetch to ensure consistency
        setTimeout(() => {
          debugLog.useBlog('Triggering refresh after deletion');
          fetchPosts();
        }, 500);

        return true;
      } catch (err) {
        console.error('Error deleting post:', err);
        debugLog.error('Error deleting post', err);

        // Check if it's a permission error
        if (err instanceof Error) {
          if (
            err.message.includes('permission-denied') ||
            err.message.includes('PERMISSION_DENIED')
          ) {
            console.error(
              'Permission denied - user may not be admin or not authenticated properly'
            );
            alert(
              'Permission denied. Please ensure you are logged in as an admin.'
            );
          } else if (err.message.includes('not-found')) {
            console.error('Post not found - may have already been deleted');
            alert('Post not found. It may have already been deleted.');
          } else {
            console.error('Unknown error:', err.message);
            alert(`Failed to delete post: ${err.message}`);
          }
        }

        return false;
      }
    },
    [fetchPosts]
  );

  const getFeaturedPosts = async (limit = 3) => {
    if (USE_MOCK_DATA) {
      return mockBlogPosts.filter((post) => post.featured).slice(0, limit);
    }

    try {
      const q = query(
        collection(db, 'blog'),
        where('featured', '==', true),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        firestoreLimit(limit)
      );

      const snapshot = await getDocs(q);
      const featuredPosts = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as BlogPost)
      );

      // If no featured posts found, use mock data
      if (featuredPosts.length === 0) {
        return mockBlogPosts.filter((post) => post.featured).slice(0, limit);
      }

      return featuredPosts;
    } catch (err) {
      console.error('Error fetching featured posts:', err);
      return mockBlogPosts.filter((post) => post.featured).slice(0, limit);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    posts,
    categories,
    loading,
    error,
    fetchPosts,
    getPostBySlug,
    getFeaturedPosts,
    deletePost,
  };
};
