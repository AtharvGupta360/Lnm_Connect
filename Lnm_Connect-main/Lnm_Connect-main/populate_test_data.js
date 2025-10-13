// MongoDB script to populate test data for chat feature
// Run this in MongoDB shell: mongosh < populate_test_data.js

use mydatabase;

print("Creating test users...");

// Create test users
db.users.insertMany([
  {
    _id: "user1",
    name: "Alice Johnson",
    email: "alice@lnmconnect.com",
    password: "$2a$10$abcdefghijklmnopqrstuvwxyz", // placeholder - use bcrypt in production
    bio: "Software Engineer passionate about full-stack development",
    education: "B.Tech Computer Science",
    branchYear: "CSE - 2024",
    contact: "+91-9876543210",
    photoUrl: "https://i.pravatar.cc/150?img=1",
    skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    interests: ["Web Development", "AI", "Open Source"],
    githubProfile: "https://github.com/alicejohnson",
    portfolio: "https://alicejohnson.dev"
  },
  {
    _id: "user2",
    name: "Bob Smith",
    email: "bob@lnmconnect.com",
    password: "$2a$10$abcdefghijklmnopqrstuvwxyz",
    bio: "Backend Developer | Cloud Enthusiast",
    education: "B.Tech Information Technology",
    branchYear: "IT - 2024",
    contact: "+91-9876543211",
    photoUrl: "https://i.pravatar.cc/150?img=2",
    skills: ["Python", "Django", "AWS", "Docker"],
    interests: ["Backend Development", "DevOps", "System Design"],
    githubProfile: "https://github.com/bobsmith",
    portfolio: "https://bobsmith.dev"
  },
  {
    _id: "user3",
    name: "Charlie Davis",
    email: "charlie@lnmconnect.com",
    password: "$2a$10$abcdefghijklmnopqrstuvwxyz",
    bio: "UI/UX Designer & Frontend Developer",
    education: "B.Tech Computer Science",
    branchYear: "CSE - 2023",
    contact: "+91-9876543212",
    photoUrl: "https://i.pravatar.cc/150?img=3",
    skills: ["Figma", "React", "CSS", "TypeScript"],
    interests: ["Design", "Frontend", "User Experience"],
    githubProfile: "https://github.com/charliedavis",
    portfolio: "https://charliedavis.design"
  },
  {
    _id: "user4",
    name: "Diana Prince",
    email: "diana@lnmconnect.com",
    password: "$2a$10$abcdefghijklmnopqrstuvwxyz",
    bio: "Data Scientist | ML Enthusiast",
    education: "B.Tech Computer Science",
    branchYear: "CSE - 2023",
    contact: "+91-9876543213",
    photoUrl: "https://i.pravatar.cc/150?img=4",
    skills: ["Python", "TensorFlow", "Pandas", "Scikit-learn"],
    interests: ["Machine Learning", "Data Analysis", "AI Research"],
    githubProfile: "https://github.com/dianaprince",
    portfolio: "https://dianaprince.ai"
  }
]);

print("Test users created successfully!");
print("");
print("Creating chat rooms...");

// Create chat rooms
const now = new Date();
const hourAgo = new Date(now - 3600000);
const dayAgo = new Date(now - 86400000);
const twoDaysAgo = new Date(now - 172800000);

db.chat_rooms.insertMany([
  {
    _id: "chat1",
    user1Id: "user1",
    user2Id: "user2",
    createdAt: twoDaysAgo,
    lastMessageAt: new Date(now - 300000) // 5 minutes ago
  },
  {
    _id: "chat2",
    user1Id: "user1",
    user2Id: "user3",
    createdAt: dayAgo,
    lastMessageAt: hourAgo
  },
  {
    _id: "chat3",
    user1Id: "user2",
    user2Id: "user4",
    createdAt: dayAgo,
    lastMessageAt: twoDaysAgo
  }
]);

print("Chat rooms created successfully!");
print("");
print("Creating sample messages...");

// Create messages for chat1 (Alice and Bob)
const chat1Messages = [];
const baseTime = twoDaysAgo.getTime();

const conversation1 = [
  { sender: "user1", text: "Hey Bob! How's the project going?", delay: 0 },
  { sender: "user2", text: "Hi Alice! Going great, just finished the API integration.", delay: 300000 },
  { sender: "user1", text: "Awesome! Can you share the documentation?", delay: 600000 },
  { sender: "user2", text: "Sure, I'll send it over in a bit.", delay: 900000 },
  { sender: "user1", text: "Thanks! Also, are you free for a call tomorrow?", delay: 7200000 },
  { sender: "user2", text: "Yes, I'm available after 2 PM. What's it about?", delay: 7500000 },
  { sender: "user1", text: "Want to discuss the deployment strategy.", delay: 7800000 },
  { sender: "user2", text: "Perfect! Let's do it at 2:30 PM then.", delay: 8100000 },
  { sender: "user1", text: "Sounds good. See you tomorrow!", delay: 8400000 },
  { sender: "user2", text: "Great! Talk to you then.", delay: 172500000 }
];

conversation1.forEach((msg, index) => {
  chat1Messages.push({
    _id: `msg1_${index + 1}`,
    chatRoomId: "chat1",
    senderId: msg.sender,
    receiverId: msg.sender === "user1" ? "user2" : "user1",
    content: msg.text,
    timestamp: new Date(baseTime + msg.delay),
    status: index < conversation1.length - 3 ? "READ" : (index < conversation1.length - 1 ? "DELIVERED" : "SENT")
  });
});

// Create messages for chat2 (Alice and Charlie)
const chat2Messages = [];
const baseTime2 = dayAgo.getTime();

const conversation2 = [
  { sender: "user3", text: "Hi Alice! I saw your design on the club portal. Really impressive!", delay: 0 },
  { sender: "user1", text: "Thank you Charlie! I was inspired by your work.", delay: 600000 },
  { sender: "user3", text: "That's so nice of you to say! Want to collaborate on the next project?", delay: 1200000 },
  { sender: "user1", text: "Absolutely! I'd love to. Let me know the details.", delay: 1800000 },
  { sender: "user3", text: "Will send over the brief by EOD.", delay: 2400000 },
];

conversation2.forEach((msg, index) => {
  chat2Messages.push({
    _id: `msg2_${index + 1}`,
    chatRoomId: "chat2",
    senderId: msg.sender,
    receiverId: msg.sender === "user1" ? "user3" : "user1",
    content: msg.text,
    timestamp: new Date(baseTime2 + msg.delay),
    status: "READ"
  });
});

// Create messages for chat3 (Bob and Diana)
const chat3Messages = [];
const baseTime3 = twoDaysAgo.getTime();

const conversation3 = [
  { sender: "user2", text: "Hey Diana! Need your help with the ML model.", delay: 0 },
  { sender: "user4", text: "Sure Bob! What do you need?", delay: 300000 },
  { sender: "user2", text: "Can you review the data preprocessing pipeline?", delay: 600000 },
  { sender: "user4", text: "I'll check it out and get back to you!", delay: 900000 },
];

conversation3.forEach((msg, index) => {
  chat3Messages.push({
    _id: `msg3_${index + 1}`,
    chatRoomId: "chat3",
    senderId: msg.sender,
    receiverId: msg.sender === "user2" ? "user4" : "user2",
    content: msg.text,
    timestamp: new Date(baseTime3 + msg.delay),
    status: "READ"
  });
});

// Insert all messages
db.messages.insertMany([...chat1Messages, ...chat2Messages, ...chat3Messages]);

print("Sample messages created successfully!");
print("");
print("Creating indexes...");

// Create indexes for performance
db.chat_rooms.createIndex({ "user1Id": 1, "user2Id": 1 }, { unique: true });
db.chat_rooms.createIndex({ "user1Id": 1 });
db.chat_rooms.createIndex({ "user2Id": 1 });
db.chat_rooms.createIndex({ "lastMessageAt": -1 });

db.messages.createIndex({ "chatRoomId": 1 });
db.messages.createIndex({ "chatRoomId": 1, "timestamp": 1 });
db.messages.createIndex({ "chatRoomId": 1, "receiverId": 1, "status": 1 });

print("Indexes created successfully!");
print("");
print("=================================================");
print("Test data population complete!");
print("=================================================");
print("");
print("Summary:");
print("- 4 test users created");
print("- 3 chat rooms created");
print(`- ${chat1Messages.length + chat2Messages.length + chat3Messages.length} messages created`);
print("");
print("Test User Credentials (for frontend testing):");
print("User 1 - Alice Johnson (ID: user1)");
print("User 2 - Bob Smith (ID: user2)");
print("User 3 - Charlie Davis (ID: user3)");
print("User 4 - Diana Prince (ID: user4)");
print("");
print("To test in browser console:");
print("localStorage.setItem('userId', 'user1');");
print("localStorage.setItem('userName', 'Alice Johnson');");
print("");
print("Then navigate to: http://localhost:5173/chat");
