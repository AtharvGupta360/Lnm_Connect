import { useState, useEffect, useCallback } from 'react';

/**
 * useInfiniteFeed Hook
 * Handles infinite scrolling/load more functionality for the feed
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.pageSize - Number of items per page
 * @param {Object} options.filters - Filter parameters
 * @param {Function} options.fetchFn - Function to fetch data
 * @returns {Object} - Feed data and control functions
 */
export function useInfiniteFeed({ pageSize = 10, filters = {}, fetchFn }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchFn({ page: page + 1, pageSize, ...filters });
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }

      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to load more items');
      console.error('Error loading more items:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, pageSize, filters, fetchFn]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(0);
    setHasMore(true);

    try {
      const newItems = await fetchFn({ page: 1, pageSize, ...filters });
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }

      setItems(newItems);
      setPage(1);
    } catch (err) {
      setError(err.message || 'Failed to refresh feed');
      console.error('Error refreshing feed:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, filters, fetchFn]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [filters]); // Only refresh when filters change

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    setItems // For optimistic updates
  };
}

export default useInfiniteFeed;
