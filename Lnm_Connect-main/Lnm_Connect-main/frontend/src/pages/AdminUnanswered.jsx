import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Trash2, MessageSquare, Clock, User, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const AdminUnanswered = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);
  const [answer, setAnswer] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchQueries();
    fetchStats();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/unanswered`);
      const data = await response.json();
      setQueries(data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleResolve = async (queryId) => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/unanswered/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_id: queryId,
          answer: answer
        })
      });

      if (response.ok) {
        alert('✅ Query resolved successfully!');
        setResolving(null);
        setAnswer('');
        fetchQueries();
        fetchStats();
      } else {
        alert('❌ Failed to resolve query');
      }
    } catch (error) {
      console.error('Error resolving query:', error);
      alert('❌ Error resolving query');
    }
  };

  const handleDelete = async (queryId) => {
    if (!confirm('Are you sure you want to delete this query?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/unanswered/${queryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Query deleted successfully!');
        fetchQueries();
        fetchStats();
      } else {
        alert('❌ Failed to delete query');
      }
    } catch (error) {
      console.error('Error deleting query:', error);
      alert('❌ Error deleting query');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <AlertCircle className="w-8 h-8 text-orange-500 mr-3" />
                Unanswered Queries
              </h1>
              <p className="text-gray-500 mt-1">Review and respond to questions the bot couldn't answer</p>
            </div>
            <button
              onClick={() => {
                fetchQueries();
                fetchStats();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Conversations</p>
                    <p className="text-2xl font-bold mt-1">{stats.total_conversations}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Messages</p>
                    <p className="text-2xl font-bold mt-1">{stats.total_messages}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Pending Queries</p>
                    <p className="text-2xl font-bold mt-1">{stats.unanswered_queries}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Resolved</p>
                    <p className="text-2xl font-bold mt-1">{stats.resolved_queries}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : queries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No pending unanswered queries at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queries.map((query, index) => (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Query Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <User className="w-4 h-4" />
                        <span>User ID: {query.user_id || 'Anonymous'}</span>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(query.timestamp)}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Question:</h3>
                          <p className="text-gray-700 leading-relaxed">{query.question}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    {resolving === query.id ? (
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Provide a detailed answer to this question..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          rows="4"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleResolve(query.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark as Resolved</span>
                          </button>
                          <button
                            onClick={() => {
                              setResolving(null);
                              setAnswer('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setResolving(query.id)}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Answer Query</span>
                        </button>
                        <button
                          onClick={() => handleDelete(query.id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUnanswered;
