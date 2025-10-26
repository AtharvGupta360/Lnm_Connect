import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, FileText, Briefcase, Hash, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../services/api';

const SearchBar = ({ isCompact = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  // Debounce the search query
  const debouncedQuery = useDebounce(query, 300);

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

  // Debounced search with API
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    api.searchAutocomplete(debouncedQuery)
      .then(response => {
        setResults(response.data);
        setIsOpen(true);
        setSelectedIndex(-1);
      })
      .catch(error => {
        console.error('Search error:', error);
        setResults(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedQuery]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || !results) return;

    const allResults = [
      ...(results.profiles || []),
      ...(results.posts || []),
      ...(results.projects || [])
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < allResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && allResults[selectedIndex]) {
        handleResultClick(allResults[selectedIndex]);
      } else {
        handleSearch(e);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

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
      <>
        {categories.map(({ key, data, icon }) => {
          if (!data || data.length === 0) return null;

          return (
            <div key={key} className="border-b border-gray-100 last:border-0">
              {/* Category Header */}
              <div className="px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {getCategoryIcon(icon)}
                  <span>{getCategoryLabel(icon)}</span>
                </div>
              </div>
              
              {/* Results List */}
              {data.map((result, idx) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors group"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar/Image */}
                    {result.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={result.imageUrl}
                          alt={result.title}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-indigo-100 transition-all"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Title */}
                      <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {result.title}
                      </div>
                      
                      {/* Subtitle */}
                      {result.subtitle && (
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {result.subtitle}
                        </div>
                      )}
                      
                      {/* Snippet */}
                      {result.snippet && (
                        <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {result.snippet}
                        </div>
                      )}
                      
                      {/* Tags */}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {result.tags.slice(0, 3).map((tag, tagIdx) => (
                            <span
                              key={tagIdx}
                              className="inline-flex items-center text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium"
                            >
                              <Hash className="w-3 h-3 mr-0.5" />
                              {tag}
                            </span>
                          ))}
                          {result.tags.length > 3 && (
                            <span className="text-xs text-gray-400 px-1 py-0.5">
                              +{result.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })}
        
        {/* View All Footer */}
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-indigo-50/30 border-t border-gray-100 sticky bottom-0">
          <button
            onClick={handleSearch}
            className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all flex items-center justify-center space-x-2 py-1"
          >
            <span>View all results for "{query}"</span>
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          {/* Search Icon */}
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none z-10" />
          
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && results && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search skills, people, projects..."
            className="w-full pl-12 pr-24 py-3.5 text-[15px] border-2 border-gray-200 rounded-xl 
                     bg-gray-50/50 backdrop-blur-sm
                     focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 
                     hover:border-gray-300 hover:bg-white
                     transition-all duration-200 outline-none 
                     placeholder:text-gray-400 text-gray-900
                     shadow-sm hover:shadow"
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={isOpen}
          />
          
          {/* Right Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {isLoading && (
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            )}
            {query && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults(null);
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && results && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            id="search-results"
            role="listbox"
            className="absolute top-full left-0 right-0 mt-2 
                     bg-white rounded-xl 
                     shadow-2xl shadow-indigo-100/50
                     border border-gray-200/80
                     overflow-hidden
                     z-[9999]
                     max-h-[400px] overflow-y-auto
                     scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                     hover:scrollbar-thumb-gray-400"
            style={{
              backdropFilter: 'blur(10px)',
            }}
          >
            {renderResults()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
