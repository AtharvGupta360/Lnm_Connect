import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Calendar,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Star,
  Clock
} from 'lucide-react';
import { api, getCurrentUserId } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const DiscoverySidebar = ({ username }) => {
  const [recommendations, setRecommendations] = useState({
    profiles: [],
    projects: [],
    events: []
  });
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingIds, setConnectingIds] = useState(new Set());
  const toast = useToast();

  useEffect(() => {
    const fetchDiscoveryData = async () => {
      try {
        const userId = getCurrentUserId();
        if (userId) {
          // Fetch all recommendations in parallel
          const [profilesRes, projectsRes, eventsRes] = await Promise.all([
            api.getProfileRecommendations(userId, 3),
            api.getProjectRecommendations(userId, 3),
            api.getEventRecommendations(userId, 3)
          ]);

          setRecommendations({
            profiles: profilesRes.data.slice(0, 3),
            projects: projectsRes.data.slice(0, 3),
            events: eventsRes.data.slice(0, 3)
          });
        }
      } catch (error) {
        console.error('Error fetching discovery data:', error);
        toast.error('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    // Set trending topics
    setTrendingTopics([
      { name: 'AI & Machine Learning', posts: 45 },
      { name: 'Web Development', posts: 38 },
      { name: 'Hackathons', posts: 32 },
      { name: 'Open Source', posts: 28 },
      { name: 'Campus Events', posts: 25 }
    ]);

    fetchDiscoveryData();
  }, []);

  // Handle connect button
  const handleConnect = async (profileUserId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const userId = getCurrentUserId();
    if (!userId) {
      toast.error('Please log in to connect');
      return;
    }

    setConnectingIds(prev => new Set(prev).add(profileUserId));

    try {
      await api.sendConnectionRequest({
        fromUserId: userId,
        toUserId: profileUserId
      });
      
      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    } finally {
      setConnectingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileUserId);
        return newSet;
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-20 space-y-4"
    >
      {/* Recommended Profiles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Recommended Profiles</h3>
            </div>
            <Link to="/recommendations" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.profiles.length > 0 ? (
            <div className="space-y-3">
              {recommendations.profiles.map((profile, idx) => (
                <Link
                  key={idx}
                  to={`/profile/${profile.userId}`}
                  className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 text-sm truncate group-hover:text-indigo-600">
                        {profile.name}
                      </p>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {profile.matchPercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {profile.commonSkills?.slice(0, 2).join(', ') || 'Similar interests'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recommendations yet</p>
          )}
        </div>
      </div>

      {/* Popular Projects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Popular Projects</h3>
            </div>
            <Link to="/recommendations" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
              View all
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : recommendations.projects.length > 0 ? (
            <div className="space-y-3">
              {recommendations.projects.map((project, idx) => (
                <div
                  key={idx}
                  className="group hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm group-hover:text-purple-600 line-clamp-1">
                        {project.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                          {project.matchPercentage}% match
                        </span>
                        {project.spotsAvailable && (
                          <span className="text-xs text-gray-500">
                            {project.spotsAvailable} spots
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No projects available</p>
          )}
        </div>
      </div>

      {/* Campus Buzz - Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Campus Buzz</h3>
            </div>
            <Link to="/recommendations" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
              View all
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recommendations.events.length > 0 ? (
            <div className="space-y-3">
              {recommendations.events.map((event, idx) => (
                <div
                  key={idx}
                  className="group hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <p className="font-medium text-gray-900 text-sm group-hover:text-orange-600 line-clamp-1">
                    {event.title}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{event.daysUntilEvent} days</span>
                    </div>
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                      {event.matchPercentage}% match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No events scheduled</p>
          )}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Trending Topics</h3>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            {trendingTopics.map((topic, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs font-medium">#{idx + 1}</span>
                  <span className="text-sm text-gray-700 group-hover:text-indigo-600 font-medium">
                    {topic.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{topic.posts} posts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
        <div className="flex items-start space-x-2">
          <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium leading-relaxed">
              "Every expert was once a beginner. Keep learning, keep growing!"
            </p>
            <p className="text-xs text-indigo-200 mt-2">— LNMConnect Community</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscoverySidebar;
