import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, FileText, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ isCompact = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/search/quick?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 350); // 350ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    
    if (result.type === 'profile') {
      navigate(`/profile/${result.id}`);
    } else if (result.type === 'post') {
      navigate(`/?postId=${result.id}`);
    } else if (result.type === 'project') {
      navigate(`/?postId=${result.id}`);
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'profile':
        return <User className="w-4 h-4" />;
      case 'post':
        return <FileText className="w-4 h-4" />;
      case 'project':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (type) => {
    switch (type) {
      case 'profile':
        return 'Profiles';
      case 'post':
        return 'Posts';
      case 'project':
        return 'Opportunities';
      default:
        return '';
    }
  };

  const renderResults = () => {
    if (!results || results.totalResults === 0) {
      return (
        <div className="px-4 py-8 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No results found for "{query}"</p>
        </div>
      );
    }

    const categories = [
      { key: 'profiles', data: results.profiles, icon: 'profile' },
      { key: 'posts', data: results.posts, icon: 'post' },
      { key: 'projects', data: results.projects, icon: 'project' }
    ];

    return (
      <div className="max-h-96 overflow-y-auto">
        {categories.map(({ key, data, icon }) => {
          if (!data || data.length === 0) return null;

          return (
            <div key={key} className="border-b border-gray-100 last:border-0">
              <div className="px-4 py-2 bg-gray-50 sticky top-0 z-10">
                <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  {getCategoryIcon(icon)}
                  <span>{getCategoryLabel(icon)}</span>
                </div>
              </div>
              {data.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start space-x-3">
                    {result.imageUrl && (
                      <img
                        src={result.imageUrl}
                        alt={result.title}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {result.title}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {result.subtitle}
                      </div>
                      {result.snippet && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {result.snippet}
                        </div>
                      )}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSearch}
            className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all results for "{query}" →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div ref={searchRef} className={`relative ${isCompact ? 'w-full' : 'w-full max-w-2xl'}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && results && setIsOpen(true)}
            placeholder="Search people, posts, and opportunities..."
            className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            )}
            {query && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults(null);
                  setIsOpen(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && results && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {renderResults()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
