import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ensureArray } from "./utils";
import { motion } from "framer-motion";
import { FaUserCircle, FaGraduationCap, FaPhone, FaEnvelope, FaUniversity, FaEdit, FaPlus, FaCertificate } from "react-icons/fa";
import MessageButton from "./components/MessageButton";
import FollowButton from "./components/FollowButton";

const API_URL = "http://localhost:8080/api";
const POSTS_URL = `${API_URL}/posts`;

const ProfilePage = ({ currentUser }) => {
  const { userId: paramUserId } = useParams();
  // Use paramUserId if present, else fallback to currentUser.id
  const userId = paramUserId || (currentUser && currentUser.id);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState({ title: '', organization: '', date: '', file: null });
  const [skillsEditMode, setSkillsEditMode] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [interestsInput, setInterestsInput] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  // Predefined skills/interests (extend as needed)
  const [allSkills] = useState(["Java", "C++", "Python", "Machine Learning", "Web Development", "React", "Node.js", "Data Science", "Cloud", "AWS", "Spring Boot", "MongoDB"]);
  const [allInterests] = useState(["AI", "Robotics", "Open Source", "Startups", "Design", "UI/UX", "Blockchain", "Cybersecurity", "Competitive Programming", "App Development", "Research", "Entrepreneurship"]);

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
        setEditProfile(data);
        setSkillsInput((data.skills || []).join(", "));
        setInterestsInput((data.interests || []).join(", "));
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
    // Fetch certificates
    fetch(`${API_URL}/certificates/user/${userId}`)
      .then(res => res.json())
      .then(data => setCertificates(Array.isArray(data) ? data : []))
      .catch(() => setCertificates([]));
  }, [userId]);

  // Skeleton loader for profile
  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center text-gray-500">
        No user selected.
      </div>
    );
  }
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="animate-pulse bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl mx-auto">
          <div className="flex items-center space-x-6 mb-6">
            <div className="rounded-full bg-slate-200 h-20 w-20" />
            <div className="flex-1 space-y-4 py-1">
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_,i) => <div key={i} className="h-4 bg-slate-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center text-gray-500">
        User not found.
      </div>
    );
  }

  // Main profile card with Framer Motion animation
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto py-8">
      {/* Profile Card */}
      {/* Card: white, rounded, shadow, padding, responsive */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl mx-auto">
        {/* Avatar, Name, Email */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow" />
            ) : (
              <FaUserCircle className="w-24 h-24 text-slate-300" />
            )}
            {/* Upload Photo Button (only for own profile) */}
            {userId === currentUser?.id && (
              <label 
                htmlFor="photo-upload" 
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-lg"
                title="Upload profile picture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingPhoto}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validate file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                      alert('File size must be less than 5MB');
                      return;
                    }

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      alert('Please select an image file');
                      return;
                    }

                    setUploadingPhoto(true);
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('userId', userId);

                    try {
                      const res = await fetch(`${API_URL}/upload/profile-picture`, {
                        method: 'POST',
                        body: formData
                      });
                      const data = await res.json();
                      
                      if (res.ok) {
                        // Update user state with new photo URL
                        setUser({ ...user, photoUrl: data.photoUrl });
                        alert('✅ Profile picture uploaded successfully!');
                      } else {
                        alert('❌ ' + (data.error || 'Failed to upload photo'));
                      }
                    } catch (error) {
                      alert('❌ Failed to upload photo');
                    } finally {
                      setUploadingPhoto(false);
                      e.target.value = ''; // Reset input
                    }
                  }}
                />
              </label>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <FaEnvelope className="inline-block mr-1" />
            {user.email}
            {userId === currentUser?.id && <span className="ml-2 text-xs text-indigo-500 font-semibold">(You)</span>}
          </div>
        </div>
        {/* User fields in 2-column grid with icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-8">
          <div className="flex items-center gap-2">
            <span className="text-slate-400"><FaUserCircle /></span>
            <span className="text-slate-500">Bio:</span>
            <span className="text-slate-900 font-medium ml-1">{user.bio || <span className="text-gray-400">No bio</span>}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400"><FaGraduationCap /></span>
            <span className="text-slate-500">Education:</span>
            <span className="text-slate-900 font-medium ml-1">{user.education || <span className="text-gray-400">Not set</span>}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400"><FaUniversity /></span>
            <span className="text-slate-500">Branch/Year:</span>
            <span className="text-slate-900 font-medium ml-1">{user.branchYear || <span className="text-gray-400">Not set</span>}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400"><FaPhone /></span>
            <span className="text-slate-500">Contact:</span>
            <span className="text-slate-900 font-medium ml-1">{user.contact || <span className="text-gray-400">Not set</span>}</span>
          </div>
        </div>
        {/* Skills and Interests as chips */}
        <div className="mt-6">
          <div className="mb-2">
            <span className="font-semibold text-slate-700">Skills: </span>
            {user.skills && user.skills.length > 0 ? user.skills.map((skill, idx) => (
              <span key={skill+idx} className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs mr-2 mb-1">{skill}</span>
            )) : <span className="text-gray-400">No skills</span>}
          </div>
          <div>
            <span className="font-semibold text-slate-700">Interests: </span>
            {user.interests && user.interests.length > 0 ? user.interests.map((interest, idx) => (
              <span key={interest+idx} className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs mr-2 mb-1">{interest}</span>
            )) : <span className="text-gray-400">No interests</span>}
          </div>
        </div>
        {/* Edit buttons / Message button / Follow button */}
        <div className="mt-6 flex gap-3 justify-end">
          {userId === currentUser?.id ? (
            <>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" onClick={() => { setEditProfile(user); setEditMode(true); }}><FaEdit /> Edit Profile</button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition" onClick={() => setSkillsEditMode(true)}><FaEdit /> Edit Skills/Interests</button>
            </>
          ) : (
            <>
              <FollowButton
                currentUserId={currentUser?.id}
                targetUserId={user.id || userId}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
              <MessageButton 
                targetUserId={user.id || userId}
                targetUserName={user.name}
                targetUserPhotoUrl={user.photoUrl}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </>
          )}
        </div>
      </div>
      {/* Edit Profile Modal (card-style, animated) */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-2xl" onClick={() => setEditMode(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-indigo-700 flex items-center gap-2"><FaEdit /> Edit Profile</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const res = await fetch(`${API_URL}/profile/me?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editProfile)
              });
              if (res.ok) {
                setUser(await res.json());
                setEditMode(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" value={editProfile.name || ''} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} placeholder="Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" value={editProfile.bio || ''} onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })} placeholder="Bio" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Education</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" value={editProfile.education || ''} onChange={e => setEditProfile({ ...editProfile, education: e.target.value })} placeholder="Education" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch/Year</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" value={editProfile.branchYear || ''} onChange={e => setEditProfile({ ...editProfile, branchYear: e.target.value })} placeholder="Branch/Year" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" value={editProfile.contact || ''} onChange={e => setEditProfile({ ...editProfile, contact: e.target.value })} placeholder="Contact" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Photo URL</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" value={editProfile.photoUrl || ''} onChange={e => setEditProfile({ ...editProfile, photoUrl: e.target.value })} placeholder="Photo URL" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition" onClick={() => setEditMode(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Edit Skills/Interests Modal (card-style, animated) */}
      {skillsEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-2xl" onClick={() => setSkillsEditMode(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-emerald-700 flex items-center gap-2"><FaEdit /> Edit Skills & Interests</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const updatedSkills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
              const updatedInterests = interestsInput.split(',').map(i => i.trim()).filter(Boolean);
              const updated = { ...user, skills: updatedSkills, interests: updatedInterests };
              const res = await fetch(`${API_URL}/profile/me?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
              });
              if (res.ok) {
                // Update user state immediately for instant UI feedback
                setUser(updated);
                setSkillsEditMode(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="Skills (comma separated)" list="skills-list" />
                <datalist id="skills-list">
                  {allSkills.map(skill => <option key={skill} value={skill} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Interests (comma separated)</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" value={interestsInput} onChange={e => setInterestsInput(e.target.value)} placeholder="Interests (comma separated)" list="interests-list" />
                <datalist id="interests-list">
                  {allInterests.map(interest => <option key={interest} value={interest} />)}
                </datalist>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition" onClick={() => setSkillsEditMode(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition">Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Certificates Section (collapsible cards) */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800"><FaCertificate className="text-amber-500" /> Certificates & Achievements</h3>
        <div className="space-y-4">
          {certificates.map(cert => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="bg-white border rounded-xl shadow p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                {cert.fileUrl ? (
                  <>
                    {/* PDF view/download */}
                    {cert.fileUrl.endsWith('.pdf') ? (
                      <a href={`${API_URL}/certificates/file/${cert.id}`} target="_blank" rel="noopener noreferrer" download className="inline-block bg-slate-200 text-slate-500 rounded-full px-3 py-2 text-xs font-semibold hover:bg-slate-300 transition">View PDF</a>
                    ) : (
                      <>
                        {/* Image preview and download */}
                        <a href={`${API_URL}/certificates/file/${cert.id}`} target="_blank" rel="noopener noreferrer">
                          <img src={`${API_URL}/certificates/file/${cert.id}`} alt="Certificate" className="w-16 h-16 object-cover rounded-lg border" />
                        </a>
                        <a href={`${API_URL}/certificates/file/${cert.id}`} download className="block mt-1 text-xs text-blue-600 hover:underline">Download</a>
                      </>
                    )}
                  </>
                ) : (
                  <span className="inline-block bg-slate-200 text-slate-400 rounded-full px-3 py-2 text-xs font-semibold">No File</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-base">{cert.title}</div>
                <div className="text-slate-500 text-sm">{cert.organization} &bull; {cert.date}</div>
              </div>
              {userId === currentUser?.id && (
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1 px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition" onClick={() => { setCertForm(cert); setShowCertModal(true); }}><FaEdit /> Edit</button>
                  <button className="inline-flex items-center gap-1 px-3 py-1 rounded bg-rose-100 text-rose-700 font-semibold hover:bg-rose-200 transition" onClick={async () => {
                    await fetch(`${API_URL}/certificates/${cert.id}`, { method: 'DELETE' });
                    setCertificates(certificates.filter(c => c.id !== cert.id));
                  }}>Delete</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        {userId === currentUser?.id && (
          <button className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition text-base" onClick={() => { setCertForm({ title: '', organization: '', date: '', file: null }); setShowCertModal(true); }}><FaPlus /> Add Certificate</button>
        )}
      </div>
      {/* Certificate Modal (card-style, animated) */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-2xl" onClick={() => setShowCertModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-emerald-700 flex items-center gap-2">{certForm.id ? <FaEdit /> : <FaPlus />} {certForm.id ? 'Edit' : 'Add'} Certificate</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              let res;
              if (certForm.id) {
                // Only update metadata, not file
                const payload = { ...certForm, userId };
                res = await fetch(`${API_URL}/certificates/${certForm.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
              } else {
                // New certificate: upload file and metadata
                const formData = new FormData();
                formData.append('userId', userId);
                formData.append('title', certForm.title);
                formData.append('organization', certForm.organization);
                formData.append('date', certForm.date);
                if (certForm.file) formData.append('file', certForm.file);
                res = await fetch(`${API_URL}/certificates/upload`, {
                  method: 'POST',
                  body: formData
                });
              }
              if (res.ok) {
                setShowCertModal(false);
                const certs = await fetch(`${API_URL}/certificates/user/${userId}`).then(r => r.json());
                setCertificates(Array.isArray(certs) ? certs : []);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} placeholder="Title" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" value={certForm.organization} onChange={e => setCertForm({ ...certForm, organization: e.target.value })} placeholder="Organization" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" value={certForm.date} onChange={e => setCertForm({ ...certForm, date: e.target.value })} placeholder="Date" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File (PDF or Image)</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" type="file" accept=".pdf,image/*" onChange={e => setCertForm({ ...certForm, file: e.target.files[0] })} />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition" onClick={() => setShowCertModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition">Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Posts Section (clean card style) */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-4 text-slate-800">{userId === currentUser?.id ? "Your Posts" : `${user.name}'s Posts`}</h3>
        {ensureArray(posts).length === 0 ? (
          <div className="text-slate-400">No posts yet.</div>
        ) : (
          <div className="space-y-6">
            {ensureArray(posts).map((post, idx) => (
              <motion.div key={post.id || post._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl shadow border p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">{user.name}</span>
                    <span className="ml-2 text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {post.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full text-xs uppercase tracking-wide border border-indigo-300">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="text-slate-800 mb-2 whitespace-pre-wrap">{post.body || post.content || post.description}</div>
                {post.image && (
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <img src={post.image} alt="Post content" className="w-full h-auto object-cover rounded-lg" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProfilePage;
