import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Edit3, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Users,
  Briefcase,
  Award,
  Eye
} from 'lucide-react';

const ProfileSidebar = ({ username, posts = [] }) => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) {
          const response = await fetch(`http://localhost:8080/api/profile/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const userPosts = posts.filter(p => p.username === username);
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 space-y-4 pr-2"
    >
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Background */}
        <div className="h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4 -mt-8">
          <div className="relative inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white shadow-lg">
              {username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          
          <div className="mt-2">
            <h3 className="font-bold text-gray-900 text-lg">{username}</h3>
            <p className="text-sm text-gray-600">
              {profileData?.bio || "Student @ LNM Institute"}
            </p>
            {profileData?.skills && profileData.skills.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {profileData.skills.slice(0, 3).join(' • ')}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="font-bold text-gray-900">{userPosts.length}</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{totalLikes}</div>
              <div className="text-xs text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">{profileData?.connections?.length || 0}</div>
              <div className="text-xs text-gray-500">Connections</div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <Link
            to="/profile"
            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-3">Quick Access</h4>
        <div className="space-y-2">
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <Briefcase className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
            <span className="text-sm text-gray-700 group-hover:text-indigo-600">My Projects</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <Award className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
            <span className="text-sm text-gray-700 group-hover:text-indigo-600">Achievements</span>
          </Link>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
        <div className="flex items-start space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-indigo-900 text-sm mb-1">Grow Your Network</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Connect with students sharing your interests and discover opportunities tailored for you!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSidebar;
