import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, Users, X, Eye, MessageCircle, Home, UserCircle, Mail, LogOut, Sparkles, UserCheck, Bell, MessageSquare } from "lucide-react";
import SignupDetails from "./SignupDetails";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import ProfilePage from "./ProfilePage";
import ChatPage from "./pages/ChatPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import MyNetworkPage from "./pages/MyNetworkPage";
import ConnectionRequestsPage from "./pages/ConnectionRequestsPage";
import SpacesPage from "./pages/SpacesPage";
import SpaceDetailPage from "./pages/SpaceDetailPage";
import ThreadDetailPage from "./pages/ThreadDetailPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import SearchBar from "./components/SearchBar";
import ProfileSidebar from "./components/ProfileSidebar";
import DiscoverySidebar from "./components/DiscoverySidebar";
import CreatePostCard from "./components/CreatePostCard";
import { PostSkeleton } from "./components/SkeletonLoaders";
import { ToastProvider } from "./contexts/ToastContext";
import { followService } from "./services/followService";

// Backend API URL
const API_URL = "http://localhost:8080/api/posts";

const POST_TAGS = [
  "Hackathon", "Internship", "Placement", "Gig/Freelance Work", "Workshop",
  "Seminar", "Coding Contest", "Campus Event", "Scholarship", "Research Opportunity",
  "Project Collaboration", "Open Source", "Startup", "Club Announcement",
  "Competition", "Volunteering", "Technical Blog", "Achievement", "Miscellaneous"
];

// Professional Header Navigation Component
const HeaderNav = ({ username, handleLogout }) => {
  const location = useLocation();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Load pending requests count
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          const currentUser = JSON.parse(user);
          const requests = await followService.getPendingRequests(currentUser.id);
          setPendingRequestsCount(requests.length);
        }
      } catch (error) {
        console.error('Error loading pending requests:', error);
      }
    };

    loadPendingRequests();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingRequests, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Reload when navigation changes

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/network', label: 'My Network', icon: UserCheck, badge: pendingRequestsCount },
    { path: '/recommendations', label: 'For You', icon: Sparkles },
    { path: '/spaces', label: 'Discussions', icon: MessageSquare },
    { path: '/profile', label: 'My Profile', icon: UserCircle },
    { path: '/chat', label: 'Messages', icon: MessageCircle }
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-8 h-8 text-indigo-600" />
            </motion.div>
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:inline">
              LNMConnect
            </span>
          </Link>

          {/* Search Bar - Desktop: Centered & Prominent (45-55% width) */}
          <div className="hidden md:flex flex-1 justify-center px-4 lg:px-8 max-w-3xl mx-auto">
            <div className="w-full">
              <SearchBar />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 flex-shrink-0">
            {navLinks.map(({ path, label, icon: Icon, badge }) => (
              <Link
                key={path}
                to={path}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{label}</span>
                  {badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                    >
                      {badge > 9 ? '9+' : badge}
                    </motion.span>
                  )}
                </motion.div>
                {isActive(path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
                    initial={false}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                {username}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-md transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-3">
          <SearchBar isCompact />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-200 bg-white">
        <nav className="flex justify-around py-2">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive(path)
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
};

// HomeContent Component - wraps homepage content with scroll-to-post functionality
const HomeContent = ({ children, posts, postRefs, highlightedPost }) => {
  const [searchParams] = useSearchParams();

  // Scroll to post when postId is in URL
  useEffect(() => {
    const postId = searchParams.get('postId');
    if (postId && posts.length > 0) {
      // Wait a bit for posts to render
      const timer = setTimeout(() => {
        const element = postRefs.current[postId];
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, posts, postRefs]);

  return children;
};

const App = () => {
  // Sorting/filtering state
  const [sortOption, setSortOption] = useState("recent");
  const [filterTag, setFilterTag] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  
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
  const [postApplyEnabled, setPostApplyEnabled] = useState(false); // New state for apply feature
  
  // Refs for scrolling to specific posts
  const postRefs = useRef({});
  const [highlightedPost, setHighlightedPost] = useState(null);

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

  // Fetch posts function
  const fetchPosts = async () => {
    if (!isLoggedIn) return;
    setIsLoadingPosts(true);
    try {
      const params = [];
      if (filterTag) params.push(`tag=${encodeURIComponent(filterTag)}`);
      params.push(`currentUserId=${encodeURIComponent(getUserId())}`);
      const url = params.length ? `${API_URL}?${params.join("&")}` : API_URL;
      console.log('Fetching posts from:', url);
      const res = await fetch(url);
      if (!res.ok) {
        console.error('Failed to fetch posts:', res.status, res.statusText);
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Posts fetched successfully:', data.length, 'posts');
      const postsWithDetails = await Promise.all(data.map(async dto => {
        const item = dto.post || {};
        const id = item.id || item._id;
        const authorId = item.authorId || item.author_id || item.userId || item.user_id || item.id || item._id;
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
        const postUser = item.authorName || item.name || username;
        const postUsername = (item.authorName || item.name || username).split(' ')[0]?.toLowerCase() || username;
        return {
          id,
          authorId,
          user: postUser,
          username: postUsername,
          title: item.title || '',
          tags: item.tags || [],
          content: item.body || item.description || '',
          timestamp: item.createdAt ? new Date(item.createdAt).toLocaleString() : "just now",
          createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
          likes,
          likedByUser,
          avatar: `https://placehold.co/40x40/f59e0b/ffffff?text=${postUsername.charAt(0).toUpperCase()}`,
          image: item.image || null,
          comments,
          commentInput: "",
          isApplyEnabled: item.isApplyEnabled || false,
          canApply: dto.canApply,
          hasApplied: dto.hasApplied,
          applicants: dto.applicants || []
        };
      }));
      // Remove duplicates based on post.id
      const uniquePosts = postsWithDetails.reduce((acc, current) => {
        const exists = acc.find(post => post.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Apply sorting on frontend
      const sortedPosts = [...uniquePosts].sort((a, b) => {
        switch (sortOption) {
          case "recent":
            return b.createdAt - a.createdAt;
          case "likes":
            return b.likes - a.likes;
          case "oldest":
            return a.createdAt - b.createdAt;
          default:
            return b.createdAt - a.createdAt;
        }
      });
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert(`Failed to load posts: ${error.message}\n\nPlease check:\n1. Backend server is running on port 8080\n2. Database connection is working\n3. Check browser console for details`);
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
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
  }, []);

  // Refetch posts when sort/filter changes or when logged in
  useEffect(() => {
    fetchPosts();
  }, [isLoggedIn, username, sortOption, filterTag]);

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
          if (!res.ok) {
            const text = await res.text();
            if (text && text.includes("User already exists")) {
              alert("A user with this email already exists. Please use a different email or log in.");
            } else {
              alert("Signup failed. Please try again.");
            }
            return;
          }
          const user = await res.json();
          setPendingUser(user);
          setShowSignupDetails(true);
          console.log("Signup successful, show details page");
        } catch (error) {
          alert("Signup failed. Please try again.");
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
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
  };

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
        const newPost = {
          ...post,
          likes: likesArr.length,
          likedByUser: likesArr.includes(getUserId())
        };
        return newPost;
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
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Enhanced Header */}
          <HeaderNav username={username} handleLogout={handleLogout} />

        <Routes>
          <Route path="/" element={
            <HomeContent posts={posts} postRefs={postRefs} highlightedPost={highlightedPost}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Sidebar - Profile (3 columns) */}
                  <div className="hidden lg:block lg:col-span-3">
                    <ProfileSidebar username={username} posts={posts} />
                  </div>

                  {/* Main Feed (6 columns) */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* Sorting/Filtering Controls */}
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Sort:</span>
                        <select 
                          value={sortOption} 
                          onChange={e => setSortOption(e.target.value)} 
                          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white hover:border-indigo-400 cursor-pointer"
                        >
                          <option value="recent">🕐 Most Recent</option>
                          <option value="likes">❤️ Most Liked</option>
                          <option value="oldest">📅 Oldest</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Filter:</span>
                        <select 
                          value={filterTag} 
                          onChange={e => setFilterTag(e.target.value)} 
                          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white hover:border-indigo-400 cursor-pointer"
                        >
                          <option value="">All Tags</option>
                          {POST_TAGS.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>

                    {/* Create Post Card */}
                    <CreatePostCard username={username} onPostCreated={fetchPosts} />

                    {/* Posts Feed */}
                    <div className="space-y-4">
                      {isLoadingPosts ? (
                        // Show skeleton loaders while loading
                        <>
                          <PostSkeleton />
                          <PostSkeleton />
                          <PostSkeleton />
                        </>
                      ) : posts.length === 0 ? (
                        // Empty state
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
                        >
                          <div className="text-gray-400 mb-4">
                            <Sparkles className="w-16 h-16 mx-auto" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                          <p className="text-gray-600">Be the first to share something with the community!</p>
                        </motion.div>
                      ) : (
                        // Show posts
                        posts.map((post) => (
                      <motion.div 
                        key={post.id}
                        ref={(el) => (postRefs.current[post.id] = el)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border p-6 ${
                          highlightedPost === post.id ? 'border-2 border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Link to={`/profile/${post.authorId || post.id}`}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ring-2 ring-white shadow-md cursor-pointer"
                            >
                              {post.user?.charAt(0).toUpperCase() || 'U'}
                            </motion.div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Link 
                                to={`/profile/${post.authorId || post.id}`} 
                                className="font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                              >
                                {post.user}
                              </Link>
                              <span className="text-sm text-gray-500">@{post.username}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{post.timestamp}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{post.title}</h3>
                            {post.tags && post.tags.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                {post.tags.map((tag, idx) => (
                                  <span 
                                    key={idx}
                                    className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            {post.image && (
                              <div className="mt-4 rounded-xl overflow-hidden">
                                <img
                                  src={post.image}
                                  alt="Post content"
                                  className="w-full h-auto object-cover rounded-xl"
                                />
                              </div>
                            )}
                            <PostCard
                              post={post}
                              currentUserId={getUserId()}
                              onApplied={fetchPosts}
                            />
                            <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center space-x-2 ${post.likedByUser ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors duration-200 font-medium`}
                              >
                                <svg className="w-5 h-5" fill={post.likedByUser ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-sm font-semibold">{post.likes}</span>
                              </motion.button>
                            </div>
                            {/* Comments Section */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="mb-3 font-semibold text-gray-800 flex items-center space-x-2 text-sm">
                                <MessageCircle className="w-4 h-4 text-indigo-600" />
                                <span>Comments ({post.comments?.length || 0})</span>
                              </div>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {post.comments && post.comments.length > 0 ? post.comments.map((c, idx) => (
                                  <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start space-x-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                      {c.userName ? c.userName.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-gray-900 text-sm">{c.userName || 'User'}</span>
                                        <span className="text-xs text-gray-400">{new Date(c.timestamp).toLocaleString()}</span>
                                      </div>
                                      <div className="text-gray-700 text-sm mt-1">{c.text}</div>
                                    </div>
                                  </motion.div>
                                )) : <div className="text-gray-400 text-sm italic text-center py-2">No comments yet. Be the first to comment!</div>}
                              </div>
                              {/* Add comment input */}
                              <div className="flex items-center mt-4 space-x-2">
                                <input
                                  type="text"
                                  value={post.commentInput || ""}
                                  onChange={e => setPosts(posts => posts.map(p => p.id === post.id ? { ...p, commentInput: e.target.value } : p))}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300 bg-gray-50"
                                  placeholder="Add a comment..."
                                />
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleAddComment(post.id)}
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                  disabled={!post.commentInput || !post.commentInput.trim()}
                                >
                                  Post
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                    )}
                    </div>
                  </div>

                  {/* Right Sidebar - Discovery (3 columns) */}
                  <div className="hidden lg:block lg:col-span-3">
                    <DiscoverySidebar username={username} />
                  </div>
                </div>
              </div>
            </HomeContent>
          } />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/network" element={<MyNetworkPage />} />
          <Route path="/network/requests" element={<ConnectionRequestsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/spaces" element={<SpacesPage />} />
          <Route path="/spaces/:spaceId" element={<SpaceDetailPage />} />
          <Route path="/threads/:threadId" element={<ThreadDetailPage />} />
          <Route path="/profile" element={<ProfilePage currentUser={getCurrentUser()} />} />
          <Route path="/profile/:userId" element={<ProfilePage currentUser={getCurrentUser()} />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
    </ToastProvider>
  );
};

export default App;

// --- POST CARD COMPONENT ---
function PostCard({ post, currentUserId, onApplied }) {
  const [showApplicants, setShowApplicants] = useState(false);
  const isOwner = post.authorId === currentUserId;
  return (
    <div className="relative">
      {/* Main post content (title, tags, body, etc.) is already rendered above */}
      {/* Apply Button or Applied State */}
      {post.isApplyEnabled && !isOwner && (
        <ApplyButton
          postId={post.id}
          userId={currentUserId}
          hasApplied={post.hasApplied}
          onApplied={onApplied}
          applicantCount={Array.isArray(post.applicants) ? post.applicants.length : 0}
        />
      )}
      {/* Owner: View Applicants Button */}
      {isOwner && post.isApplyEnabled && (
        <button
          className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200 hover:bg-blue-100 transition"
          onClick={() => setShowApplicants(true)}
        >
          <Users className="w-5 h-5" />
          View Applicants
          {Array.isArray(post.applicants) && post.applicants.length > 0 && (
            <span className="ml-2 bg-blue-200 text-blue-800 rounded-full px-2 py-0.5 text-xs font-bold">{post.applicants.length}</span>
          )}
        </button>
      )}
      <AnimatePresence>
        {showApplicants && (
          <ApplicantsModal
            applicants={post.applicants || []}
            onClose={() => setShowApplicants(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- APPLY BUTTON COMPONENT ---
function ApplyButton({ postId, userId, hasApplied, onApplied, applicantCount }) {
  const [applied, setApplied] = useState(hasApplied);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  useEffect(() => { setApplied(hasApplied); }, [hasApplied]);

  const handleApply = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/apply?userId=${userId}`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      setApplied(true);
      if (onApplied) onApplied();
      toast("Application submitted successfully!", "success");
    } catch (e) {
      setError(e.message || "Could not apply");
      toast(e.message || "Could not apply", "error");
    }
    setLoading(false);
    setShowConfirm(false);
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      {applied ? (
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-500 font-semibold border border-gray-200 cursor-not-allowed"
          disabled
        >
          <CheckCircle className="w-5 h-5 text-green-500" />
          Applied <span className="ml-1">✅</span>
        </button>
      ) : (
        <>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setShowConfirm(true)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
            Apply
            {typeof applicantCount === 'number' && (
              <span className="ml-2 bg-blue-200 text-blue-800 rounded-full px-2 py-0.5 text-xs font-bold">{applicantCount} applicants</span>
            )}
          </button>
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative flex flex-col items-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <X className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 cursor-pointer" onClick={() => setShowConfirm(false)} />
                  <Eye className="w-12 h-12 text-blue-600 mb-2" />
                  <h3 className="text-lg font-bold mb-2 text-gray-900">Apply for this opportunity?</h3>
                  <p className="text-gray-600 mb-4 text-center">Are you sure you want to apply for this opportunity? This action cannot be undone.</p>
                  <div className="flex gap-4 mt-2">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                      onClick={() => setShowConfirm(false)}
                      disabled={loading}
                    >Cancel</button>
                    <button
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all duration-200"
                      onClick={handleApply}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin inline-block" /> : "Confirm & Apply"}
                    </button>
                  </div>
                  {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// --- APPLICANTS MODAL COMPONENT ---
function ApplicantsModal({ applicants, onClose }) {
  const currentUserId = localStorage.getItem("userId");
  const [applicantsList, setApplicantsList] = useState(applicants);
  const [loadingAction, setLoadingAction] = useState({});

  useEffect(() => {
    setApplicantsList(applicants);
  }, [applicants]);

  const handleAccept = async (applicationId, applicantName) => {
    if (!window.confirm(`Accept application from ${applicantName}?`)) return;
    
    setLoadingAction(prev => ({ ...prev, [applicationId]: 'accepting' }));
    try {
      const res = await fetch(`http://localhost:8080/api/posts/applications/${applicationId}/accept?ownerId=${currentUserId}`, { 
        method: 'PUT' 
      });
      if (!res.ok) throw new Error(await res.text());
      
      // Update local state
      setApplicantsList(prev => prev.map(app => 
        app.applicationId === applicationId 
          ? { ...app, status: 'ACCEPTED' } 
          : app
      ));
      
      toast(`Application from ${applicantName} accepted!`, "success");
    } catch (e) {
      toast(e.message || "Could not accept application", "error");
    }
    setLoadingAction(prev => ({ ...prev, [applicationId]: null }));
  };

  const handleReject = async (applicationId, applicantName) => {
    if (!window.confirm(`Reject application from ${applicantName}?`)) return;
    
    setLoadingAction(prev => ({ ...prev, [applicationId]: 'rejecting' }));
    try {
      const res = await fetch(`http://localhost:8080/api/posts/applications/${applicationId}/reject?ownerId=${currentUserId}`, { 
        method: 'PUT' 
      });
      if (!res.ok) throw new Error(await res.text());
      
      // Update local state
      setApplicantsList(prev => prev.map(app => 
        app.applicationId === applicationId 
          ? { ...app, status: 'REJECTED' } 
          : app
      ));
      
      toast(`Application from ${applicantName} rejected`, "success");
    } catch (e) {
      toast(e.message || "Could not reject application", "error");
    }
    setLoadingAction(prev => ({ ...prev, [applicationId]: null }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">✓ Accepted</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">✗ Rejected</span>;
      case 'PENDING':
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">⏳ Pending</span>;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden p-8 relative flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>
          <X />
        </button>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700">
          <Users className="w-7 h-7" /> Applicants ({applicantsList.length})
        </h2>
        
        <div className="overflow-y-auto flex-1">
          {applicantsList.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No applicants yet.</div>
          ) : (
            <ul className="space-y-3">
              {applicantsList.map(u => (
                <li key={u.id} className="flex items-start gap-4 bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition">
                  <div className="flex-shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`}
                      alt={u.name}
                      className="w-12 h-12 rounded-full border-2 border-blue-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-blue-900">{u.name}</div>
                      {getStatusBadge(u.status)}
                    </div>
                    <div className="text-xs text-blue-700">{u.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Applied: {u.dateApplied ? new Date(u.dateApplied).toLocaleString() : "-"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a
                      href={`/profile/${u.id}`}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition text-center"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </a>
                    
                    {u.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAccept(u.applicationId, u.name)}
                          disabled={loadingAction[u.applicationId]}
                          className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          {loadingAction[u.applicationId] === 'accepting' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(u.applicationId, u.name)}
                          disabled={loadingAction[u.applicationId]}
                          className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          {loadingAction[u.applicationId] === 'rejecting' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- TOAST/NOTIFICATION ---
function toast(message, type = "info") {
  const id = `toast-${Date.now()}`;
  const color = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600";
  const icon = type === "success" ? <CheckCircle className="w-5 h-5 mr-2" /> : type === "error" ? <X className="w-5 h-5 mr-2" /> : <Loader2 className="w-5 h-5 mr-2" />;
  const toastDiv = document.createElement("div");
  toastDiv.id = id;
  toastDiv.className = `fixed top-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-white font-semibold text-sm ${color} animate-fade-in`;
  toastDiv.innerHTML = `<span>${icon.props.children ? icon.props.children : ''}</span>${message}`;
  document.body.appendChild(toastDiv);
  setTimeout(() => {
    toastDiv.classList.add("animate-fade-out");
    setTimeout(() => { document.body.removeChild(toastDiv); }, 400);
  }, 2500);
}

// --- APPLICANT LIST COMPONENT ---
function ApplicantList({ applicants }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-2">
      <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded font-semibold" onClick={() => setShow(!show)}>
        {show ? "Hide" : "Show"} Applicants
      </button>
      {show && (
        <div className="mt-2 bg-slate-50 border rounded p-2 max-h-40 overflow-y-auto">
          {applicants.length === 0 ? <div className="text-gray-400">No applicants yet.</div> : (
            <ul>
              {applicants.map(u => (
                <li key={u.id} className="mb-1 flex items-center gap-2">
                  <Link to={`/profile/${u.id}`} className="text-indigo-700 hover:underline font-semibold">{u.name}</Link>
                  <span className="text-xs text-gray-500">{u.email}</span>
                  {u.dateApplied && <span className="text-xs text-gray-400 ml-2">{new Date(u.dateApplied).toLocaleString()}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}