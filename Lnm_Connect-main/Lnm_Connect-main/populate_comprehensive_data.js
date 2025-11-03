// Comprehensive Data Population Script for LNM Connect
// Run this script using: node populate_comprehensive_data.js

const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'lnmconnect';

// Sample data arrays
const firstNames = ['Aarav', 'Diya', 'Vihaan', 'Ananya', 'Arjun', 'Isha', 'Kabir', 'Saanvi', 'Reyansh', 'Aanya', 
                    'Shaurya', 'Navya', 'Atharv', 'Pari', 'Krishna', 'Kiara', 'Advait', 'Myra', 'Ayaan', 'Sara',
                    'Vivaan', 'Anika', 'Aditya', 'Ahana', 'Rudra', 'Siya', 'Pranav', 'Riya', 'Dhruv', 'Kavya'];

const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Joshi', 'Malhotra', 'Nair',
                   'Iyer', 'Mehta', 'Kapoor', 'Rao', 'Desai', 'Bose', 'Chatterjee', 'Agarwal', 'Banerjee', 'Das'];

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical'];
const years = [1, 2, 3, 4];
const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'CHE'];

const skills = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB', 'SQL', 'C++', 'Machine Learning',
  'Data Science', 'Web Development', 'Mobile Development', 'UI/UX Design', 'Cloud Computing', 'DevOps',
  'Blockchain', 'Cybersecurity', 'AI', 'Flutter', 'Django', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes'
];

const interests = [
  'Coding', 'Music', 'Sports', 'Photography', 'Traveling', 'Reading', 'Gaming', 'Writing',
  'Art', 'Dance', 'Singing', 'Cooking', 'Fitness', 'Yoga', 'Volunteering', 'Entrepreneurship'
];

const postTags = [
  'Hackathon', 'Internship', 'Placement', 'Workshop', 'Seminar', 'Coding Contest',
  'Campus Event', 'Scholarship', 'Project Collaboration', 'Open Source', 'Startup',
  'Club Announcement', 'Competition', 'Achievement', 'Technical Blog'
];

const postTitles = [
  'Exciting Internship Opportunity at Tech Giant!',
  'Hackathon Alert: Code for Innovation 2025',
  'Workshop on Machine Learning - This Weekend',
  'Placement Drive: Multiple Companies Visiting Campus',
  'Looking for Team Members - Startup Project',
  'Won First Prize at National Coding Competition!',
  'Free AWS Certification Course Available',
  'Web Development Bootcamp Starting Next Month',
  'Research Paper Published in IEEE Conference',
  'Open Source Project Contributors Needed',
  'Campus Placement Success Story',
  'Tech Talk: Future of AI and Robotics',
  'Scholarship Opportunity for Final Year Students',
  'Project Showcase - Innovative IoT Solutions',
  'Coding Club Registration Open Now!'
];

const spaceNames = [
  'Web Development Hub', 'Machine Learning Enthusiasts', 'Competitive Programming',
  'Mobile App Developers', 'Cybersecurity Forum', 'Data Science Community',
  'Blockchain & Crypto', 'Cloud Computing Group', 'UI/UX Designers',
  'Open Source Contributors', 'Startup Ideas & Innovation', 'AI Research Lab',
  'DevOps & CI/CD', 'Game Development', 'IoT Projects'
];

const messageTemplates = [
  'Hey! How are you doing?',
  'Thanks for connecting! Let\'s collaborate on a project.',
  'Great profile! Would love to discuss opportunities.',
  'Are you participating in the upcoming hackathon?',
  'I saw your recent project. Really impressive work!',
  'Let\'s catch up sometime. Coffee?',
  'Do you have any experience with [skill]?',
  'I\'m organizing a study group. Interested?',
  'Your presentation was amazing!',
  'Can you help me with a doubt?'
];

// Helper Functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@lnmiit.ac.in`;
}

async function populateDatabase() {
  const url = 'mongodb://localhost:27017';
const dbName = 'mydatabase';

const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Skip clearing existing data to preserve user's profile, chats, and recommendations
    console.log('\n✨ Adding new data to existing database (preserving your data)...');
    
    // Get existing user count to avoid conflicts
    
    // Create Users
    console.log('\n👥 Creating 50 users...');
    const users = [];
    for (let i = 0; i < 50; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const user = {
        _id: new ObjectId(),
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName + i),
        password: 'password123', // In production, this should be hashed
        skills: randomElements(skills, Math.floor(Math.random() * 6) + 3),
        interests: randomElements(interests, Math.floor(Math.random() * 5) + 2),
        department: randomElement(departments),
        year: randomElement(years),
        branch: randomElement(branches),
        bio: `${randomElement(['Passionate', 'Enthusiastic', 'Dedicated', 'Creative'])} ${randomElement(departments)} student. Love ${randomElements(interests, 2).join(' and ')}.`,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        followerCount: 0,
        followingCount: 0,
        createdAt: randomDate(new Date(2024, 0, 1), new Date())
      };
      users.push(user);
    }
    await db.collection('users').insertMany(users);
    console.log(`✅ Created ${users.length} users`);
    
    // Create Follows
    console.log('\n🤝 Creating follow relationships...');
    const follows = [];
    for (let i = 0; i < 150; i++) {
      const follower = randomElement(users);
      const following = randomElement(users);
      
      if (follower._id.toString() !== following._id.toString()) {
        follows.push({
          followerId: follower._id.toString(),
          followingId: following._id.toString(),
          createdAt: randomDate(new Date(2024, 0, 1), new Date())
        });
      }
    }
    
    // Remove duplicates
    const uniqueFollows = Array.from(new Set(follows.map(f => `${f.followerId}-${f.followingId}`)))
      .map(key => follows.find(f => `${f.followerId}-${f.followingId}` === key));
    
    await db.collection('follows').insertMany(uniqueFollows);
    
    // Update follower counts
    for (const user of users) {
      const followerCount = uniqueFollows.filter(f => f.followingId === user._id.toString()).length;
      const followingCount = uniqueFollows.filter(f => f.followerId === user._id.toString()).length;
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { followerCount, followingCount } }
      );
    }
    console.log(`✅ Created ${uniqueFollows.length} follow relationships`);
    
    // Create Posts
    console.log('\n📝 Creating 100 posts...');
    const posts = [];
    for (let i = 0; i < 100; i++) {
      const author = randomElement(users);
      const isApplyEnabled = Math.random() > 0.6;
      const hasDeadline = isApplyEnabled && Math.random() > 0.5;
      
      const post = {
        _id: new ObjectId(),
        title: randomElement(postTitles),
        body: `This is an exciting opportunity! ${randomElement([
          'Don\'t miss out on this amazing chance to learn and grow.',
          'Perfect for students looking to gain real-world experience.',
          'Join us for an incredible learning experience.',
          'Limited seats available. Register now!',
          'This will be a game-changer for your career.'
        ])} ${randomElement([
          'Requirements: Passionate learners with basic programming knowledge.',
          'Open to all branches and years.',
          'Great networking opportunity!',
          'Certificates will be provided.',
          'Exciting prizes to be won!'
        ])}`,
        tags: randomElements(postTags, Math.floor(Math.random() * 3) + 1),
        authorId: author._id.toString(),
        authorName: author.name,
        image: Math.random() > 0.7 ? `https://picsum.photos/800/400?random=${i}` : null,
        likes: new Set(randomElements(users, Math.floor(Math.random() * 20)).map(u => u._id.toString())),
        comments: [],
        taggedUserIds: [],
        taggedClubIds: [],
        isApplyEnabled: isApplyEnabled,
        applicationIds: [],
        applicationDeadline: hasDeadline ? randomDate(new Date(), new Date(2025, 11, 31)).getTime() : null,
        createdAt: randomDate(new Date(2024, 6, 1), new Date()).getTime()
      };
      
      // Add comments
      const commentCount = Math.floor(Math.random() * 8);
      for (let j = 0; j < commentCount; j++) {
        const commenter = randomElement(users);
        post.comments.push({
          userId: commenter._id.toString(),
          userName: commenter.name,
          text: randomElement([
            'Great opportunity!', 'Thanks for sharing!', 'Count me in!',
            'This looks interesting.', 'When does this start?',
            'Is this open for first years?', 'Amazing initiative!',
            'I\'m definitely applying!', 'Can you share more details?'
          ]),
          timestamp: randomDate(new Date(post.createdAt), new Date()).getTime()
        });
      }
      
      posts.push(post);
    }
    
    // Convert Sets to Arrays for MongoDB
    posts.forEach(post => {
      post.likes = Array.from(post.likes);
    });
    
    await db.collection('posts').insertMany(posts);
    console.log(`✅ Created ${posts.length} posts`);
    
    // Create Applications
    console.log('\n📋 Creating applications...');
    const applications = [];
    const applyEnabledPosts = posts.filter(p => p.isApplyEnabled);
    
    for (const post of applyEnabledPosts) {
      const applicantCount = Math.floor(Math.random() * 15) + 1;
      const applicants = randomElements(users.filter(u => u._id.toString() !== post.authorId), applicantCount);
      
      for (const applicant of applicants) {
        const statuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
        const weights = [0.6, 0.25, 0.15]; // 60% pending, 25% accepted, 15% rejected
        const random = Math.random();
        let status = 'PENDING';
        if (random < weights[2]) status = 'REJECTED';
        else if (random < weights[1] + weights[2]) status = 'ACCEPTED';
        
        const application = {
          _id: new ObjectId(),
          userId: applicant._id.toString(),
          postId: post._id.toString(),
          status: status,
          dateApplied: randomDate(new Date(post.createdAt), new Date())
        };
        applications.push(application);
        post.applicationIds.push(application._id.toString());
      }
    }
    
    if (applications.length > 0) {
      await db.collection('applications').insertMany(applications);
      
      // Update posts with application IDs
      for (const post of applyEnabledPosts) {
        await db.collection('posts').updateOne(
          { _id: post._id },
          { $set: { applicationIds: post.applicationIds } }
        );
      }
      console.log(`✅ Created ${applications.length} applications`);
    }
    
    // Create Spaces
    console.log('\n🏢 Creating spaces...');
    const spaces = [];
    for (let i = 0; i < spaceNames.length; i++) {
      const creator = randomElement(users);
      const space = {
        _id: new ObjectId(),
        name: spaceNames[i],
        description: `A collaborative space for ${spaceNames[i].toLowerCase()} enthusiasts. Join us to share knowledge, collaborate on projects, and grow together!`,
        tags: randomElements(skills, 3),
        rules: [
          'Be respectful and constructive',
          'No spam or self-promotion',
          'Share quality content',
          'Help others learn and grow'
        ],
        creatorId: creator._id.toString(),
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        memberIds: randomElements(users, Math.floor(Math.random() * 20) + 5).map(u => u._id.toString())
      };
      spaces.push(space);
    }
    await db.collection('spaces').insertMany(spaces);
    console.log(`✅ Created ${spaces.length} spaces`);
    
    // Create Threads
    console.log('\n💬 Creating discussion threads...');
    const threads = [];
    for (const space of spaces) {
      const threadCount = Math.floor(Math.random() * 5) + 2;
      for (let i = 0; i < threadCount; i++) {
        const author = randomElement(users.filter(u => space.memberIds.includes(u._id.toString())));
        const thread = {
          _id: new ObjectId(),
          title: `Discussion: ${randomElement([
            'Best practices for', 'Getting started with', 'Tips for learning',
            'Resources for', 'Help needed with', 'Share your experience with'
          ])} ${randomElement(skills)}`,
          body: `Hi everyone! I wanted to start a discussion about this topic. ${randomElement([
            'What are your thoughts?', 'Any suggestions?', 'Would love to hear your experiences.',
            'Let\'s share our knowledge!', 'Looking forward to your inputs!'
          ])}`,
          tags: randomElements(skills, 2),
          authorId: author._id.toString(),
          spaceId: space._id.toString(),
          upvotes: new Set(randomElements(users, Math.floor(Math.random() * 15)).map(u => u._id.toString())),
          downvotes: new Set(randomElements(users, Math.floor(Math.random() * 3)).map(u => u._id.toString())),
          replies: [],
          createdAt: randomDate(new Date(space.createdAt), new Date())
        };
        
        // Add replies
        const replyCount = Math.floor(Math.random() * 8);
        for (let j = 0; j < replyCount; j++) {
          const replier = randomElement(users.filter(u => space.memberIds.includes(u._id.toString())));
          thread.replies.push({
            _id: new ObjectId().toString(),
            userId: replier._id.toString(),
            userName: replier.name,
            text: randomElement([
              'Great question! Here\'s what I think...', 'I agree with this approach.',
              'Thanks for starting this discussion!', 'Here are some resources that helped me.',
              'I had a similar experience.', 'This is really helpful!'
            ]),
            upvotes: randomElements(users, Math.floor(Math.random() * 5)).map(u => u._id.toString()),
            createdAt: randomDate(new Date(thread.createdAt), new Date())
          });
        }
        
        thread.upvotes = Array.from(thread.upvotes);
        thread.downvotes = Array.from(thread.downvotes);
        threads.push(thread);
      }
    }
    await db.collection('threads').insertMany(threads);
    console.log(`✅ Created ${threads.length} discussion threads`);
    
    // Create Chat Rooms and Messages
    console.log('\n💬 Creating chat rooms and messages...');
    const chatRooms = [];
    const messages = [];
    
    for (let i = 0; i < 80; i++) {
      const user1 = randomElement(users);
      const user2 = randomElement(users.filter(u => u._id.toString() !== user1._id.toString()));
      
      const chatRoom = {
        _id: new ObjectId(),
        user1Id: user1._id.toString(),
        user2Id: user2._id.toString(),
        createdAt: randomDate(new Date(2024, 6, 1), new Date()),
        lastMessageAt: new Date()
      };
      chatRooms.push(chatRoom);
      
      // Create messages for this chat room
      const messageCount = Math.floor(Math.random() * 10) + 3;
      for (let j = 0; j < messageCount; j++) {
        const sender = Math.random() > 0.5 ? user1 : user2;
        const receiver = sender._id.toString() === user1._id.toString() ? user2 : user1;
        
        const message = {
          _id: new ObjectId(),
          chatRoomId: chatRoom._id.toString(),
          senderId: sender._id.toString(),
          receiverId: receiver._id.toString(),
          content: randomElement(messageTemplates).replace('[skill]', randomElement(skills)),
          timestamp: randomDate(new Date(chatRoom.createdAt), new Date()),
          status: randomElement(['SENT', 'DELIVERED', 'READ'])
        };
        messages.push(message);
        
        if (j === messageCount - 1) {
          chatRoom.lastMessageAt = message.timestamp;
        }
      }
    }
    
    await db.collection('chat_rooms').insertMany(chatRooms);
    await db.collection('messages').insertMany(messages);
    console.log(`✅ Created ${chatRooms.length} chat rooms and ${messages.length} messages`);
    
    // Create Certificates
    console.log('\n🏆 Creating certificates...');
    const certificates = [];
    for (let i = 0; i < 30; i++) {
      const user = randomElement(users);
      const certificate = {
        _id: new ObjectId(),
        userId: user._id.toString(),
        title: `${randomElement(['AWS', 'Google Cloud', 'Microsoft Azure', 'Oracle', 'Cisco'])} ${randomElement(['Developer', 'Associate', 'Professional'])} Certification`,
        issuer: randomElement(['AWS', 'Google', 'Microsoft', 'Oracle', 'Cisco', 'IBM', 'Coursera', 'Udemy']),
        issueDate: randomDate(new Date(2023, 0, 1), new Date()),
        fileId: new ObjectId().toString(),
        verified: Math.random() > 0.3
      };
      certificates.push(certificate);
    }
    await db.collection('certificates').insertMany(certificates);
    console.log(`✅ Created ${certificates.length} certificates`);
    
    // Create Items (Lost & Found)
    console.log('\n🔍 Creating lost & found items...');
    const items = [];
    const itemTypes = ['Lost', 'Found'];
    const itemCategories = ['Electronics', 'Books', 'Accessories', 'Clothing', 'Stationery', 'Keys', 'ID Cards'];
    const itemNames = {
      'Electronics': ['Laptop', 'Phone', 'Earbuds', 'Charger', 'Smartwatch', 'Calculator'],
      'Books': ['Textbook', 'Novel', 'Notebook', 'Journal'],
      'Accessories': ['Wallet', 'Watch', 'Glasses', 'Bag', 'Water Bottle'],
      'Clothing': ['Jacket', 'Cap', 'Scarf', 'Gloves'],
      'Stationery': ['Pen', 'Pencil Box', 'Geometry Box', 'Calculator'],
      'Keys': ['Room Keys', 'Bike Keys', 'Locker Keys'],
      'ID Cards': ['Student ID', 'Library Card', 'Mess Card']
    };
    
    for (let i = 0; i < 40; i++) {
      const user = randomElement(users);
      const category = randomElement(itemCategories);
      const item = {
        _id: new ObjectId(),
        type: randomElement(itemTypes),
        category: category,
        name: randomElement(itemNames[category]),
        description: `${randomElement(['Black', 'Blue', 'Red', 'Grey', 'White'])} colored. ${randomElement(['Last seen at', 'Found near', 'Lost in'])} ${randomElement(['Library', 'Canteen', 'Auditorium', 'Lab', 'Hostel', 'Sports Ground'])}.`,
        location: randomElement(['Main Building', 'Library', 'Canteen', 'Hostel Block A', 'Hostel Block B', 'Sports Complex', 'Academic Block']),
        userId: user._id.toString(),
        contactNumber: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        date: randomDate(new Date(2024, 9, 1), new Date()),
        resolved: Math.random() > 0.6
      };
      items.push(item);
    }
    await db.collection('items').insertMany(items);
    console.log(`✅ Created ${items.length} lost & found items`);
    
    // Create Recommendations
    console.log('\n🎯 Creating recommendations...');
    const recommendations = [];
    for (const user of users.slice(0, 30)) {
      const recommendedUsers = randomElements(
        users.filter(u => u._id.toString() !== user._id.toString()),
        5
      );
      
      const recommendation = {
        _id: new ObjectId(),
        userId: user._id.toString(),
        recommendedUserIds: recommendedUsers.map(u => u._id.toString()),
        lastUpdated: new Date(),
        scores: recommendedUsers.map(() => Math.random())
      };
      recommendations.push(recommendation);
    }
    await db.collection('recommendations').insertMany(recommendations);
    console.log(`✅ Created ${recommendations.length} recommendation sets`);
    
    console.log('\n\n🎉 Database population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Users: ${users.length}`);
    console.log(`   • Posts: ${posts.length}`);
    console.log(`   • Applications: ${applications.length}`);
    console.log(`   • Follow Relationships: ${uniqueFollows.length}`);
    console.log(`   • Spaces: ${spaces.length}`);
    console.log(`   • Discussion Threads: ${threads.length}`);
    console.log(`   • Chat Rooms: ${chatRooms.length}`);
    console.log(`   • Messages: ${messages.length}`);
    console.log(`   • Certificates: ${certificates.length}`);
    console.log(`   • Lost & Found Items: ${items.length}`);
    console.log(`   • Recommendations: ${recommendations.length}`);
    
    console.log('\n✨ Your LNM Connect project is now populated with rich, realistic data!');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await client.close();
    console.log('\n📦 Database connection closed.');
  }
}

// Run the population script
populateDatabase();
