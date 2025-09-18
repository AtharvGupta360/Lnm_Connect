import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ensureArray } from "./utils";

const API_URL = "http://localhost:8080/api";
const POSTS_URL = `${API_URL}/posts`;

const ProfilePage = ({ currentUser }) => {
  const { userId: paramUserId } = useParams();
  // Use paramUserId if present, else fallback to currentUser.id
  const userId = paramUserId || (currentUser && currentUser.id);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Fetch user data
    fetch(`${API_URL}/auth/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

      // Fetch posts for user (unified endpoint)
      fetch(`${POSTS_URL}/user/${userId}`)
      .then(res => {
        if (res.status === 404) return [];
        return res.json();
      })
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]));
  }, [userId]);

  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center text-gray-500">
        No user selected.
      </div>
    );
  }
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Profile Info + Skills/Interests */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            {userId === currentUser?.id && <span className="text-xs text-indigo-500 font-semibold">(You)</span>}
          </div>
        </div>
        {/* Skills and Interests */}
        <div className="mt-4">
          {user.skills && user.skills.length > 0 && (
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Skills: </span>
              {user.skills.map((skill, idx) => (
                <span key={skill+idx} className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs mr-2 mb-1">{skill}</span>
              ))}
            </div>
          )}
          {user.interests && user.interests.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Interests: </span>
              {user.interests.map((interest, idx) => (
                <span key={interest+idx} className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs mr-2 mb-1">{interest}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Posts Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{userId === currentUser?.id ? "Your Posts" : `${user.name}'s Posts`}</h3>
        {ensureArray(posts).length === 0 ? (
          <div className="text-gray-500">No posts yet.</div>
        ) : (
          <div className="space-y-6">
            {ensureArray(posts).map((post, idx) => (
              <div key={post.id || post._id || idx} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {post.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full text-xs uppercase tracking-wide border border-indigo-300">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="text-gray-800 mb-2 whitespace-pre-wrap">{post.body || post.content || post.description}</div>
                {post.image && (
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <img src={post.image} alt="Post content" className="w-full h-auto object-cover rounded-lg" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
