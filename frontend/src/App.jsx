import React, { useState, useEffect } from "react";
// Backend API URL
const API_URL = "http://localhost:8080/api/items";

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState("");

  // Initialize from local storage on mount
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const storedUsername = localStorage.getItem("username");
    const storedUser = localStorage.getItem("user");
    
    if (storedIsLoggedIn === "true" && storedUsername && storedUser) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  // Fetch posts from backend when logged in or username changes
  useEffect(() => {
    if (isLoggedIn) {
      fetch(API_URL)
        .then(res => res.json())
        .then(data => {
          setPosts(data.map(item => ({
            id: item.id || item._id,
            user: item.name || username,
            username: username,
            content: item.description,
            timestamp: "just now",
            likes: 0,
            avatar: `https://placehold.co/40x40/f59e0b/ffffff?text=${username.charAt(0).toUpperCase()}`,
            image: item.image || null
          })));
        })
        .catch(() => setPosts([]));
    }
  }, [isLoggedIn, username]);

  // Real authentication with backend
  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      // Login
      if (email && password) {
        try {
          const res = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
          const user = await res.json();
          setIsLoggedIn(true);
          const userUsername = user.name.split(' ')[0].toLowerCase();
          setUsername(userUsername);
          
          // Store in localStorage
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", userUsername);
          localStorage.setItem("user", JSON.stringify(user));
          
          console.log("Login successful");
        } catch (error) {
          alert("Invalid credentials");
        }
      }
    } else {
      // Signup
      if (name && email && password) {
        try {
          const res = await fetch("http://localhost:8080/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
          });
          const user = await res.json();
          setIsLoggedIn(true);
          const userUsername = name.split(' ')[0].toLowerCase();
          setUsername(userUsername);
          
          // Store in localStorage
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", userUsername);
          localStorage.setItem("user", JSON.stringify(user));
          
          console.log("Signup successful");
        } catch (error) {
          alert("User already exists");
        }
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setName("");
    setUsername("");
    // Clear localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
  };

  // Add new post to backend
  const handleAddPost = async (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      const item = {
        name: username.charAt(0).toUpperCase() + username.slice(1),
        description: newPost,
        image: postImage || null
      };
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item)
        });
        const saved = await res.json();
        setPosts([{ 
          id: saved.id || saved._id,
          user: saved.name || username,
          username: username,
          content: saved.description,
          timestamp: "just now",
          likes: 0,
          avatar: `https://placehold.co/40x40/f59e0b/ffffff?text=${username.charAt(0).toUpperCase()}`,
          image: saved.image || null
        }, ...posts]);
        setNewPost("");
        setPostImage("");
      } catch {
        setPosts([{ ...item, id: posts.length + 1, likes: 0, timestamp: "just now", avatar: `https://placehold.co/40x40/f59e0b/ffffff?text=${username.charAt(0).toUpperCase()}` }, ...posts]);
        setNewPost("");
        setPostImage("");
      }
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Join Us"}
            </h1>
            <p className="text-indigo-100">
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>
          <div className="p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  LNMConnect
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create a post</h2>
              <form onSubmit={handleAddPost} className="space-y-4">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="What's on your mind?"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Image URL (optional)"
                  />
                  <button
                    type="submit"
                    disabled={!newPost.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-start space-x-3">
                    <img
                      src={post.avatar}
                      alt={post.user}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{post.user}</h3>
                        <span className="text-sm text-gray-500">@{post.username}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{post.timestamp}</span>
                      </div>
                      <p className="text-gray-800 mt-2 whitespace-pre-wrap">{post.content}</p>
                      
                      {post.image && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          <img
                            src={post.image}
                            alt="Post content"
                            className="w-full h-auto object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-6 mt-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Profile</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{username}</p>
                  <p className="text-sm text-gray-500">@{username}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-medium">{posts.filter(p => p.username === username).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Likes</span>
                  <span className="font-medium">
                    {posts.reduce((sum, post) => sum + post.likes, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
              <h3 className="font-semibold text-indigo-900 mb-2">Pro Tip</h3>
              <p className="text-indigo-700 text-sm">
                Share photos and stories to connect with others. The more you post, the more engagement you'll receive!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
