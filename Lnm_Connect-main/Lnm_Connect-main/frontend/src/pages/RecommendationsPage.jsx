import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import recommendationService from '../services/recommendationService';

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profiles'); // 'profiles', 'projects', 'events'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [profileRecommendations, setProfileRecommendations] = useState([]);
  const [projectRecommendations, setProjectRecommendations] = useState([]);
  const [eventRecommendations, setEventRecommendations] = useState([]);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser.id || currentUser._id;

  useEffect(() => {
    if (userId) {
      loadRecommendations();
    }
  }, [userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const [profiles, projects, events] = await Promise.all([
        recommendationService.getProfileRecommendations(userId),
        recommendationService.getProjectRecommendations(userId),
        recommendationService.getEventRecommendations(userId)
      ]);
      
      setProfileRecommendations(profiles);
      setProjectRecommendations(projects);
      setEventRecommendations(events);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await recommendationService.refreshRecommendations(userId);
      await loadRecommendations();
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-blue-600';
    if (percentage >= 30) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const ProfileCard = ({ profile }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => navigate(`/profile/${profile.userId}`)}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            profile.name?.charAt(0).toUpperCase()
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-800">{profile.name}</h3>
            <div className={`text-2xl font-bold ${getMatchColor(profile.matchPercentage)}`}>
              {profile.matchPercentage}%
            </div>
          </div>
          
          {profile.bio && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{profile.bio}</p>
          )}
          
          {profile.branchYear && (
            <p className="text-gray-500 text-sm mb-2">{profile.branchYear}</p>
          )}
          
          {profile.matchReason && (
            <div className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full inline-block mb-3">
              {profile.matchReason}
            </div>
          )}
          
          {profile.commonSkills && profile.commonSkills.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Common Skills:</p>
              <div className="flex flex-wrap gap-1">
                {profile.commonSkills.slice(0, 5).map((skill, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
                {profile.commonSkills.length > 5 && (
                  <span className="text-xs text-gray-500">+{profile.commonSkills.length - 5} more</span>
                )}
              </div>
            </div>
          )}
          
          {profile.complementarySkills && profile.complementarySkills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">They can teach you:</p>
              <div className="flex flex-wrap gap-1">
                {profile.complementarySkills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Connect
          </button>
        </div>
      </div>
    </motion.div>
  );

  const ProjectCard = ({ project }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => navigate(`/projects/${project.projectId}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-800 flex-1">{project.title}</h3>
        <div className={`text-2xl font-bold ${getMatchColor(project.matchPercentage)}`}>
          {project.matchPercentage}%
        </div>
      </div>
      
      {project.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
      )}
      
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
        <span>👤 {project.ownerName}</span>
        {project.domain && <span>📂 {project.domain}</span>}
        {project.spotsAvailable > 0 && (
          <span className="text-green-600 font-medium">
            {project.spotsAvailable} spot{project.spotsAvailable !== 1 ? 's' : ''} available
          </span>
        )}
      </div>
      
      {project.matchReason && (
        <div className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full inline-block mb-3">
          {project.matchReason}
        </div>
      )}
      
      {project.matchingSkills && project.matchingSkills.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">Your matching skills:</p>
          <div className="flex flex-wrap gap-1">
            {project.matchingSkills.map((skill, idx) => (
              <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {project.learningOpportunities && project.learningOpportunities.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">You'll learn:</p>
          <div className="flex flex-wrap gap-1">
            {project.learningOpportunities.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                📚 {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {project.difficulty && (
        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2">
          {project.difficulty}
        </span>
      )}
      
      <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
        Join Project
      </button>
    </motion.div>
  );

  const EventCard = ({ event }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => navigate(`/events/${event.eventId}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-800 flex-1">{event.title}</h3>
        <div className={`text-2xl font-bold ${getMatchColor(event.matchPercentage)}`}>
          {event.matchPercentage}%
        </div>
      </div>
      
      {event.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
      )}
      
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
        <span>👤 {event.organizerName}</span>
        {event.activityType && <span>🎯 {event.activityType}</span>}
        {event.daysUntilEvent !== undefined && event.daysUntilEvent >= 0 && (
          <span className="text-orange-600 font-medium">
            {event.daysUntilEvent === 0 ? 'Today!' : `In ${event.daysUntilEvent} day${event.daysUntilEvent !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>
      
      {event.location && (
        <p className="text-gray-500 text-sm mb-2">📍 {event.location}</p>
      )}
      
      {event.matchReason && (
        <div className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full inline-block mb-3">
          {event.matchReason}
        </div>
      )}
      
      {event.matchingInterests && event.matchingInterests.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">Matches your interests:</p>
          <div className="flex flex-wrap gap-1">
            {event.matchingInterests.map((interest, idx) => (
              <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {event.skillsToLearn && event.skillsToLearn.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Skills you'll gain:</p>
          <div className="flex flex-wrap gap-1">
            {event.skillsToLearn.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {event.spotsAvailable > 0 && (
        <p className="text-green-600 text-sm mb-2">
          {event.spotsAvailable} spot{event.spotsAvailable !== 1 ? 's' : ''} available
        </p>
      )}
      
      <button className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
        Register
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Recommended for You
              </h1>
              <p className="text-gray-600">
                Intelligent recommendations based on your skills, interests, and activity
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                refreshing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            {[
              { id: 'profiles', label: 'Profiles', count: profileRecommendations.length },
              { id: 'projects', label: 'Projects', count: projectRecommendations.length },
              { id: 'events', label: 'Events', count: eventRecommendations.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'profiles' && (
              <motion.div
                key="profiles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {profileRecommendations.length > 0 ? (
                  profileRecommendations.map((profile) => (
                    <ProfileCard key={profile.userId} profile={profile} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-20 text-gray-500">
                    <p className="text-lg">No profile recommendations available yet.</p>
                    <p className="text-sm mt-2">Complete your profile to get better recommendations!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {projectRecommendations.length > 0 ? (
                  projectRecommendations.map((project) => (
                    <ProjectCard key={project.projectId} project={project} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-20 text-gray-500">
                    <p className="text-lg">No project recommendations available yet.</p>
                    <p className="text-sm mt-2">Add your skills to discover matching projects!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {eventRecommendations.length > 0 ? (
                  eventRecommendations.map((event) => (
                    <EventCard key={event.eventId} event={event} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-20 text-gray-500">
                    <p className="text-lg">No event recommendations available yet.</p>
                    <p className="text-sm mt-2">Add your interests to discover relevant events!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
