import React, { useState, useEffect } from "react";
// ...existing code...
// Backend API URL
const POST_TAGS = [
  "Hackathon", "Internship", "Placement", "Gig/Freelance Work", "Workshop",
  "Seminar", "Coding Contest", "Campus Event", "Scholarship", "Research Opportunity",
  "Project Collaboration", "Open Source", "Startup", "Club Announcement",
  "Competition", "Volunteering", "Technical Blog", "Achievement", "Miscellaneous"
];
import SignupDetails from "./SignupDetails";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import ProfilePage from "./ProfilePage";
// Backend API URL
const API_URL = "http://localhost:8080/api/posts";

const App = () => {
  // State for all users and clubs (for tagging in Create Post)
  const [allUsers, setAllUsers] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postTags, setPostTags] = useState([]);
  const [postBody, setPostBody] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");
  const [showSignupDetails, setShowSignupDetails] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  // State for tagging users and clubs in Create Post
  const [taggedUserIds, setTaggedUserIds] = useState([]);
  const [taggedClubIds, setTaggedClubIds] = useState([]);

  // Handle extended signup details after signup
  const handleSignupDetails = async (details) => {
    if (!pendingUser) return;
    try {
      const res = await fetch(`http://localhost:8080/api/auth/user/${pendingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
      });
      const updatedUser = await res.json();
      setIsLoggedIn(true);
    const userUsername = updatedUser && updatedUser.name ? updatedUser.name.split(' ')[0].toLowerCase() : "";
      setUsername(userUsername);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", userUsername);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowSignupDetails(false);
      setPendingUser(null);
    } catch {
      alert("Failed to save details");
    }
  };

  const handleSkipSignupDetails = () => {
    if (!pendingUser) return;
    setIsLoggedIn(true);
  const userUsername = pendingUser && pendingUser.name ? pendingUser.name.split(' ')[0].toLowerCase() : "";
    setUsername(userUsername);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", userUsername);
    localStorage.setItem("user", JSON.stringify(pendingUser));
    setShowSignupDetails(false);
    setPendingUser(null);
  };

  // Returns the current user object from localStorage
  const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const storedUsername = localStorage.getItem("username");
    const storedUser = localStorage.getItem("user");
    if (storedIsLoggedIn === "true" && storedUsername && storedUser) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }

    // Fetch all users for tagging
    async function fetchAllUsers() {
      try {
        const res = await fetch("http://localhost:8080/api/users");
        if (res.ok) {
          const users = await res.json();
          setAllUsers(users);
        }
      } catch {}
    }
    // Fetch all clubs for tagging
    async function fetchAllClubs() {
      try {
        const res = await fetch("http://localhost:8080/api/clubs");
        if (res.ok) {
          const clubs = await res.json();
          setAllClubs(clubs);
        }
      } catch {}
    }
    if (isLoggedIn) {
      fetchAllUsers();
      fetchAllClubs();
    }

    async function fetchPosts() {
      if (isLoggedIn) {
        try {
          const res = await fetch(API_URL);
          const data = await res.json();
          const postsWithDetails = await Promise.all(data.map(async item => {
            const id = item.id || item._id;
            // Fetch likes
            let likes = 0;
            let likedByUser = false;
            try {
              const resLikes = await fetch(`${API_URL}/${id}/likes`);
              const likesArr = await resLikes.json();
              likes = Array.isArray(likesArr) ? likesArr.length : 0;
              likedByUser = Array.isArray(likesArr) && likesArr.includes(getUserId());
            } catch {}
            // Fetch comments
            let comments = [];
            try {
              const resComments = await fetch(`${API_URL}/${id}/comments`);
              comments = await resComments.json();
            } catch {}
            // Use new Post fields if present, fallback to old Item fields
            const postUser = item.authorName || item.name || username;
            const postUsername = (item.authorName || item.name || username).split(' ')[0]?.toLowerCase() || username;
            return {
              id,
              user: postUser,
              username: postUsername,
              title: item.title || '',
              tags: item.tags || [],
              content: item.body || item.description || '',
              timestamp: item.createdAt ? new Date(item.createdAt).toLocaleString() : "just now",
              likes,
              likedByUser,
              avatar: `https://placehold.co/40x40/f59e0b/ffffff?text=${postUsername.charAt(0).toUpperCase()}`,
              image: item.image || null,
              comments,
              commentInput: ""
            };
          }));
          setPosts(postsWithDetails);
        } catch {
          setPosts([]);
        }
      }
    }
    fetchPosts();
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
          if (!res.ok) {
            throw new Error("Invalid credentials");
          }
          const user = await res.json();
          if (!user || !user.name || !user.email) {
            throw new Error("Invalid credentials");
          }
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
          setIsLoggedIn(false);
          setUsername("");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("username");
          localStorage.removeItem("user");
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
          setPendingUser(user);
          setShowSignupDetails(true);
          // Do not set isLoggedIn yet; wait for details or skip
          console.log("Signup successful, show details page");
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
    // Legacy add post logic removed. Use modal/create post form only.
    return;
  };

  // Helper to get userId from localStorage (simulate, fallback to username)
  function getUserId() {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.id || parsed._id || parsed.email || username;
      } catch {
        return username;
      }
    }
    return username;
  }

  // Like/unlike post using backend
  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/${postId}/like?userId=${encodeURIComponent(getUserId())}`, {
        method: "POST"
      });
      const updated = await res.json();
      // Update post in state
      setPosts(posts => posts.map(post => {
        if (post.id !== postId) return post;
        const likesArr = updated.likes || [];
        return {
          ...post,
          likes: likesArr.length,
          likedByUser: likesArr.includes(getUserId())
        };
      }));
    } catch {}
  };

  // Add comment to post
  const handleAddComment = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.commentInput.trim()) return;
    const comment = {
      userId: getUserId(),
      userName: username,
      text: post.commentInput,
      timestamp: Date.now()
    };
    try {
      const res = await fetch(`${API_URL}/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment)
      });
      const updated = await res.json();
      setPosts(posts => posts.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: updated.comments || [],
          commentInput: ""
        };
      }));
    } catch {}
  };

  if (showSignupDetails && pendingUser) {
    return <SignupDetails onSubmit={handleSignupDetails} onSkip={handleSkipSignupDetails} />;
  }
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
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    LNMConnect
                  </Link>
                </div>
                <nav className="ml-8 space-x-4">
                  <Link to="/profile" className="text-indigo-600 hover:underline font-semibold">My Profile</Link>
                </nav>
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
        <Routes>
          <Route path="/" element={
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Create Post */}
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Create a post</h2>
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium mb-2"
                      onClick={() => setShowCreatePost(true)}
                    >Create Post</button>
                    {showCreatePost && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
                          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowCreatePost(false)}>&times;</button>
                          <h3 className="text-xl font-bold mb-4 text-indigo-700">New Post</h3>
                          {postError && <div className="text-red-500 mb-2">{postError}</div>}
                          {postSuccess && <div className="text-green-600 mb-2">{postSuccess}</div>}
                          <form onSubmit={async e => {
                            e.preventDefault();
                            setPostError("");
                            setPostSuccess("");
                            if (!postTitle.trim() || postTags.length === 0 || !postBody.trim()) {
                              setPostError("Please fill all required fields.");
                              return;
                            }
                            try {
                              const user = getCurrentUser();
                              const res = await fetch("http://localhost:8080/api/posts", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  title: postTitle,
                                  tags: postTags,
                                  body: postBody,
                                  image: postImage,
                                  authorId: user && user.id,
                                  authorName: user && user.name,
                                  taggedUserIds,
                                  taggedClubIds
                                })
                              });
                              if (!res.ok) throw new Error("Failed to create post");
                              setPostSuccess("Post created successfully!");
                              setPostTitle("");
                              setPostTags([]);
                              setPostBody("");
                              setPostImage("");
                              setTaggedUserIds([]);
                              setTaggedClubIds([]);
                              setTimeout(() => {
                                setShowCreatePost(false);
                                setPostSuccess("");
                              }, 1200);
                            } catch {
                              setPostError("Failed to create post. Please try again.");
                            }
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Users</label>
                                <select
                                  multiple
                                  value={taggedUserIds}
                                  onChange={e => {
                                    const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                                    setTaggedUserIds(opts);
                                  }}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                  {allUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                  ))}
                                </select>
                                <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Clubs</label>
                                <select
                                  multiple
                                  value={taggedClubIds}
                                  onChange={e => {
                                    const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                                    setTaggedClubIds(opts);
                                  }}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                  {allClubs.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                                <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</div>
                              </div>
                            </>
                          }} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title<span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={postTitle}
                                onChange={e => setPostTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter post title"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tags<span className="text-red-500">*</span></label>
                              <select
                                multiple
                                value={postTags}
                                onChange={e => {
                                  const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                                  setPostTags(opts);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                {POST_TAGS.map(tag => (
                                  <option key={tag} value={tag}>{tag}</option>
                                ))}
                              </select>
                              <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Body<span className="text-red-500">*</span></label>
                              <textarea
                                value={postBody}
                                onChange={e => setPostBody(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                rows="5"
                                placeholder="Write your post here..."
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                              <input
                                type="text"
                                value={postImage}
                                onChange={e => setPostImage(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Image URL (optional)"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                              >Post</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
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
                              {/* User name links to profile */}
                              <Link to={`/profile/${encodeURIComponent(post.user)}`} className="font-semibold text-gray-900 hover:underline">{post.user}</Link>
                              <span className="text-sm text-gray-500">@{post.username}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{post.timestamp}</span>
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="mb-2 flex flex-wrap gap-2">
                                {post.tags.map((tag, idx) => (
                                  <span key={idx} className="font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full text-xs uppercase tracking-wide border border-indigo-300">#{tag}</span>
                                ))}
                              </div>
                            )}
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
                                className={`flex items-center space-x-1 ${post.likedByUser ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors duration-200`}
                              >
                                <svg className="w-5 h-5" fill={post.likedByUser ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-sm font-medium">{post.likes}</span>
                              </button>
                            </div>
                            {/* Comments Section */}
                            <div className="mt-4">
                              <div className="mb-2 font-semibold text-gray-700">Comments</div>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {post.comments && post.comments.length > 0 ? post.comments.map((c, idx) => (
                                  <div key={idx} className="flex items-start space-x-2">
                                    <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                                      {c.userName ? c.userName.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-800 text-sm">{c.userName || 'User'}</span>
                                      <span className="ml-2 text-xs text-gray-400">{new Date(c.timestamp).toLocaleString()}</span>
                                      <div className="text-gray-700 text-sm">{c.text}</div>
                                    </div>
                                  </div>
                                )) : <div className="text-gray-400 text-sm">No comments yet.</div>}
                              </div>
                              {/* Add comment input */}
                              <div className="flex items-center mt-2 space-x-2">
                                <input
                                  type="text"
                                  value={post.commentInput || ""}
                                  onChange={e => setPosts(posts => posts.map(p => p.id === post.id ? { ...p, commentInput: e.target.value } : p))}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  placeholder="Add a comment..."
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                  disabled={!post.commentInput || !post.commentInput.trim()}
                                >
                                  Comment
                                </button>
                              </div>
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
          } />
          <Route path="/profile" element={<ProfilePage currentUser={getCurrentUser()} />} />
          <Route path="/profile/:userId" element={<ProfilePage currentUser={getCurrentUser()} />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
