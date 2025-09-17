import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ensureArray } from "./utils";

const API_URL = "http://localhost:8080/api";

const ProfilePage = ({ currentUser }) => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      let userData = null;
      if (!userId || userId === currentUser?.id) {
        // My profile
        userData = currentUser;
      } else {
        // Other user
        const res = await fetch(`${API_URL}/auth/user/${userId}`);
        userData = await res.json();
      }
      setUser(userData);
      // Fetch posts by userId (author id) using the correct endpoint
      if (userData?.id) {
        const resPosts = await fetch(`${API_URL}/items/userId/${encodeURIComponent(userData.id)}`);
        const data = await resPosts.json();
        setPosts(ensureArray(data));
      } else {
        setPosts([]);
      }
      setLoading(false);
    }
    fetchProfile();
    // eslint-disable-next-line
  }, [userId, currentUser]);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
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
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">{userId === currentUser?.id ? "Your Posts" : `${user.name}'s Posts`}</h3>
        {ensureArray(posts).length === 0 ? (
          <div className="text-gray-500">No posts yet.</div>
        ) : (
          <div className="space-y-6">
            {ensureArray(posts).map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-gray-800 mb-2 whitespace-pre-wrap">{post.content || post.description}</div>
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
};

export default ProfilePage;
