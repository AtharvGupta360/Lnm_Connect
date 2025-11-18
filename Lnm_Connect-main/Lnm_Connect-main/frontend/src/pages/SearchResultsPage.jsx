import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, FileText, Briefcase, Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import MessageButton from '../components/MessageButton';
import UserLink from '../components/UserLink';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (query.trim()) {
      fetchResults();
    }
  }, [query]);

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8080/api/search?q=${encodeURIComponent(query)}&limit=20`
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'profiles', label: 'Profiles', icon: User },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'projects', label: 'Opportunities', icon: Briefcase }
  ];

  const getFilteredResults = () => {
    if (!results) return [];
    
    switch (activeTab) {
      case 'profiles':
        return results.profiles || [];
      case 'posts':
        return results.posts || [];
      case 'projects':
        return results.projects || [];
      case 'all':
      default:
        // Combine all results and remove duplicates by ID
        const allResults = [
          ...(results.profiles || []),
          ...(results.posts || []),
          ...(results.projects || [])
        ];
        
        // Remove duplicates based on ID
        const uniqueResults = allResults.filter((result, index, self) =>
          index === self.findIndex((r) => r.id === result.id)
        );
        
        return uniqueResults;
    }
  };

  const filteredResults = getFilteredResults();

  const getCategoryCount = (category) => {
    if (!results) return 0;
    return results[category]?.length || 0;
  };

  const renderResultCard = (result) => {
    switch (result.type) {
      case 'profile':
        return <ProfileCard key={result.id} result={result} />;
      case 'post':
        return <PostCard key={result.id} result={result} />;
      case 'project':
        return <ProjectCard key={result.id} result={result} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Oops!</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchResults}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            {results?.totalResults || 0} results found for "{query}"
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = tab.id === 'all' ? results?.totalResults : getCategoryCount(tab.id);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {filteredResults.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No {activeTab !== 'all' ? activeTab : 'results'} found</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6"
            >
              {filteredResults.map((result) => renderResultCard(result))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Profile Card Component
const ProfileCard = ({ result }) => {
  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const currentUser = getCurrentUser();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-indigo-200"
    >
      <div className="flex items-start space-x-4">
        <UserLink userId={result.id} userName={result.title}>
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={result.imageUrl}
            alt={result.title}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-100 cursor-pointer"
          />
        </UserLink>
        <div className="flex-1 min-w-0">
          <UserLink
            userId={result.id}
            userName={result.title}
            className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            {result.title}
          </UserLink>
          <p className="text-gray-600 text-sm mt-1">{result.subtitle}</p>
          {result.snippet && (
            <p className="text-gray-500 text-sm mt-2">{result.snippet}</p>
          )}
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {result.tags.slice(0, 5).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <Link
            to={`/profile/${result.id}`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors text-center"
          >
            View Profile
          </Link>
          {currentUser && currentUser.id !== result.id && (
            <MessageButton 
              targetUserId={result.id}
              targetUserName={result.title}
              targetUserPhotoUrl={result.imageUrl}
              className="text-sm"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Post Card Component
const PostCard = ({ result }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-indigo-200"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <FileText className="w-12 h-12 text-indigo-600 bg-indigo-50 p-2 rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/?postId=${result.id}`}
            className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            {result.title}
          </Link>
          <p className="text-gray-600 text-sm mt-1">
            by <Link to={`/profile/${result.authorId}`} className="text-indigo-600 hover:underline">{result.authorName}</Link>
          </p>
          {result.snippet && (
            <p className="text-gray-700 mt-3 line-clamp-3">{result.snippet}</p>
          )}
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {result.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link
          to={`/?postId=${result.id}`}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 rounded-lg text-sm font-semibold transition-colors"
        >
          View Post
        </Link>
      </div>
    </motion.div>
  );
};

// Project/Opportunity Card Component
const ProjectCard = ({ result }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // Navigate to home page with postId in URL
    navigate(`/?postId=${result.id}`, { replace: false });
  };

  const handleApplyNow = () => {
    // Navigate to home page with postId and scroll to post
    navigate(`/?postId=${result.id}`, { state: { scrollToPost: true, autoApply: true } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-indigo-200"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Briefcase className="w-12 h-12 text-indigo-600 bg-white p-2 rounded-lg shadow-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <Link
                to={`/?postId=${result.id}`}
                className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {result.title}
              </Link>
              <p className="text-gray-600 text-sm mt-1">
                by <Link to={`/profile/${result.authorId}`} className="text-indigo-600 hover:underline">{result.authorName}</Link>
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              Opportunity
            </span>
          </div>
          {result.snippet && (
            <p className="text-gray-700 mt-3 line-clamp-2">{result.snippet}</p>
          )}
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {result.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleViewDetails}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              View Details
            </button>
            <button 
              onClick={handleApplyNow}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 rounded-lg text-sm font-semibold transition-colors"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResultsPage;
