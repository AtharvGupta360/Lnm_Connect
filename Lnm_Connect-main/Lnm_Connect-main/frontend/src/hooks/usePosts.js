import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/posts';

/**
 * OPTIMIZED: Infinite scroll hook for paginated posts feed
 * Uses React Query's useInfiniteQuery for efficient pagination and caching
 * 
 * Benefits:
 * - Only loads 10 posts at a time (not entire database)
 * - Automatic caching - instant load on revisit
 * - Background refetch keeps data fresh
 * - No refetch on window focus (prevents unnecessary API calls)
 * - Optimistic updates for instant UI feedback
 */
export const useInfinitePosts = (sortOption = 'recent', filterTag = '', currentUserId = '', enabled = true) => {
  return useInfiniteQuery({
    queryKey: ['posts-infinite', sortOption, filterTag, currentUserId],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        page: pageParam,
        limit: 10,
        sort: sortOption || 'recent',
        currentUserId: currentUserId || ''
      });
      
      if (filterTag) {
        params.append('tag', filterTag);
      }
      
      const response = await axios.get(`${API_BASE}/feed?${params.toString()}`);
      return response.data; // Returns { posts: [], totalCount, currentPage, hasMore, ... }
    },
    getNextPageParam: (lastPage) => {
      // Return next page number if there are more posts
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 1000 * 30, // 30 seconds - data stays fresh
    gcTime: 1000 * 60 * 5, // 5 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    refetchOnMount: false, // Don't refetch if data exists in cache
    enabled
  });
};

// Legacy hook - kept for backwards compatibility
// ⚠️ WARNING: This loads ALL posts. Use useInfinitePosts instead!
export const usePosts = (sortOption = 'recent', filterTag = '', enabled = true) => {
  return useQuery({
    queryKey: ['posts', sortOption, filterTag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sortOption) params.append('sort', sortOption);
      if (filterTag) params.append('tag', filterTag);
      
      const response = await axios.get(`${API_BASE}?${params.toString()}`);
      return response.data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    enabled
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData) => {
      const response = await axios.post(API_BASE, postData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both legacy and infinite queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts-infinite'] });
    }
  });
};

// Like post mutation with optimistic updates
export const useLikePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, userId }) => {
      const response = await axios.post(`${API_BASE}/${postId}/like?userId=${encodeURIComponent(userId)}`);
      return response.data;
    },
    onMutate: async ({ postId, userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts-infinite'] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['posts-infinite']);
      
      // Optimistically update infinite query data
      queryClient.setQueryData(['posts-infinite'], (old) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) => {
              if (post.post?.id === postId || post.id === postId) {
                const currentPost = post.post || post;
                const likes = currentPost.likes || [];
                const isLiked = Array.isArray(likes) ? likes.includes(userId) : false;
                
                return {
                  ...post,
                  post: {
                    ...currentPost,
                    likes: isLiked 
                      ? likes.filter((id) => id !== userId)
                      : [...likes, userId]
                  }
                };
              }
              return post;
            })
          }))
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['posts-infinite'], context.previousData);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['posts-infinite'] });
    }
  });
};

// Add comment mutation
export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, comment }) => {
      const response = await axios.post(`${API_BASE}/${postId}/comment`, comment);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts-infinite'] });
    }
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, userId }) => {
      const response = await axios.delete(`${API_BASE}/${postId}?userId=${encodeURIComponent(userId)}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts-infinite'] });
    }
  });
};

