const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'mydatabase';

async function populateCampusBuzzData() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const campusBuzzCollection = db.collection('campus_buzz');
    
    // Get some existing user IDs for authors
    const users = await db.collection('users').find({}).limit(10).toArray();
    const userIds = users.map(u => u._id.toString());
    
    console.log('\n📰 Creating Campus Buzz items...');
    
    // Current time and future dates
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    const campusBuzzData = [
      // PLACEMENT News
      {
        title: 'Google Hiring Drive - Applications Open!',
        description: 'Google is conducting campus recruitment for Software Engineer roles. Eligible students from CSE, ECE, and IT branches can apply. CTC: 18-22 LPA. Registration deadline: Nov 10th.',
        category: 'PLACEMENT',
        imageUrl: 'https://placehold.co/400x200/4285f4/ffffff?text=Google+Hiring',
        link: 'https://careers.google.com',
        eventDate: now + (7 * oneDayMs), // 7 days from now
        isPinned: true,
        venue: 'TPO Office',
        priority: 5
      },
      {
        title: 'Microsoft Campus Drive Results Announced',
        description: 'Congratulations to all selected candidates! 15 students have been selected for SDE roles with Microsoft. Join us for the celebration ceremony.',
        category: 'PLACEMENT',
        imageUrl: 'https://placehold.co/400x200/00a4ef/ffffff?text=Microsoft+Results',
        link: null,
        eventDate: now + (2 * oneDayMs),
        isPinned: false,
        venue: 'Auditorium',
        priority: 4
      },
      {
        title: 'Amazon SDE Internship Applications',
        description: 'Amazon is offering summer internships for pre-final year students. Work on real-world projects at Amazon. Stipend: 80k/month. Apply by Nov 15th.',
        category: 'PLACEMENT',
        imageUrl: 'https://placehold.co/400x200/ff9900/ffffff?text=Amazon+Internship',
        link: 'https://amazon.jobs',
        eventDate: now + (12 * oneDayMs),
        isPinned: true,
        venue: 'Online',
        priority: 5
      },
      {
        title: 'Resume Building Workshop by TPO',
        description: 'Learn to create an impressive resume that stands out. Industry experts will review your resumes and provide personalized feedback.',
        category: 'PLACEMENT',
        imageUrl: null,
        link: null,
        eventDate: now + (3 * oneDayMs),
        isPinned: false,
        venue: 'LT-1',
        priority: 3
      },
      
      // CULTURAL Fest News
      {
        title: 'Plinth 2025 - Registrations Open!',
        description: 'LNMIIT\'s annual techno-management fest is here! Register for exciting competitions, workshops, and events. Win prizes worth 5 Lakhs!',
        category: 'CULTURAL',
        imageUrl: 'https://placehold.co/400x200/e91e63/ffffff?text=Plinth+2025',
        link: 'https://plinth.in',
        eventDate: now + (30 * oneDayMs),
        isPinned: true,
        venue: 'LNMIIT Campus',
        priority: 5
      },
      {
        title: 'Vivacity Dandiya Night - This Weekend!',
        description: 'Get ready for the most awaited Dandiya night! Live DJ, traditional attire, and lots of fun. Entry with college ID.',
        category: 'CULTURAL',
        imageUrl: 'https://placehold.co/400x200/9c27b0/ffffff?text=Dandiya+Night',
        link: null,
        eventDate: now + (3 * oneDayMs),
        isPinned: false,
        venue: 'Open Air Theater',
        priority: 4
      },
      {
        title: 'Photography Competition - "Campus Diaries"',
        description: 'Capture the essence of campus life! Submit your best shots. Winners get professional cameras and certificates. Theme: Daily Campus Life.',
        category: 'CULTURAL',
        imageUrl: 'https://placehold.co/400x200/ff5722/ffffff?text=Photo+Contest',
        link: null,
        eventDate: now + (10 * oneDayMs),
        isPinned: false,
        venue: 'Submit Online',
        priority: 3
      },
      
      // TECHNICAL Events
      {
        title: 'HackLNMIIT - 36 Hour Hackathon',
        description: '36-hour coding marathon! Build innovative solutions, win exciting prizes. Prizes worth 1 Lakh. Food and accommodation provided.',
        category: 'TECHNICAL',
        imageUrl: 'https://placehold.co/400x200/673ab7/ffffff?text=HackLNMIIT',
        link: 'https://hacklnmiit.tech',
        eventDate: now + (15 * oneDayMs),
        isPinned: true,
        venue: 'Computer Center',
        priority: 5
      },
      {
        title: 'AWS Cloud Workshop - Register Now',
        description: 'Learn cloud computing with AWS. Get hands-on experience with EC2, S3, Lambda, and more. Free AWS credits for participants!',
        category: 'TECHNICAL',
        imageUrl: 'https://placehold.co/400x200/ff9900/ffffff?text=AWS+Workshop',
        link: null,
        eventDate: now + (5 * oneDayMs),
        isPinned: false,
        venue: 'Lab 2',
        priority: 4
      },
      {
        title: 'GeeksforGeeks Coding Contest',
        description: 'Test your problem-solving skills! Top performers will be featured on GFG campus ambassador board. Win GFG goodies and certificates.',
        category: 'TECHNICAL',
        imageUrl: 'https://placehold.co/400x200/2f8d46/ffffff?text=GFG+Contest',
        link: 'https://geeksforgeeks.org',
        eventDate: now + (4 * oneDayMs),
        isPinned: false,
        venue: 'Online',
        priority: 3
      },
      {
        title: 'AI/ML Seminar by IIT Delhi Professor',
        description: 'Distinguished lecture on Latest Trends in Artificial Intelligence and Machine Learning. Open to all branches. Certificate of participation provided.',
        category: 'TECHNICAL',
        imageUrl: null,
        link: null,
        eventDate: now + (8 * oneDayMs),
        isPinned: false,
        venue: 'Auditorium',
        priority: 4
      },
      
      // SPORTS Events
      {
        title: 'Inter-Branch Cricket Tournament',
        description: 'Register your branch team now! Knockout format tournament. Winning team gets trophy and cash prize of ₹10,000.',
        category: 'SPORTS',
        imageUrl: 'https://placehold.co/400x200/4caf50/ffffff?text=Cricket+Tournament',
        link: null,
        eventDate: now + (6 * oneDayMs),
        isPinned: false,
        venue: 'Sports Ground',
        priority: 3
      },
      {
        title: 'Yoga and Meditation Session',
        description: 'Start your day with peace and energy! Professional yoga instructor. All students and faculty welcome. Bring your own mat.',
        category: 'SPORTS',
        imageUrl: null,
        link: null,
        eventDate: now + (1 * oneDayMs),
        isPinned: false,
        venue: 'Open Air Theater',
        priority: 2
      },
      {
        title: 'Annual Sports Meet - Nominations Open',
        description: 'LNMIIT Annual Sports Championship! Nominate yourself for athletics, cricket, football, badminton, chess, and more. Glory awaits!',
        category: 'SPORTS',
        imageUrl: 'https://placehold.co/400x200/ff9800/ffffff?text=Sports+Meet',
        link: null,
        eventDate: now + (20 * oneDayMs),
        isPinned: true,
        venue: 'Sports Complex',
        priority: 4
      },
      
      // ANNOUNCEMENTS
      {
        title: 'Mid-Semester Exam Schedule Released',
        description: 'Check the official notice board and college website for detailed exam schedule. Mid-sem exams start from Nov 15th. All the best!',
        category: 'ANNOUNCEMENT',
        imageUrl: null,
        link: null,
        eventDate: now + (12 * oneDayMs),
        isPinned: true,
        venue: 'Academic Block',
        priority: 5
      },
      {
        title: 'Library Timings Extended for Exams',
        description: 'Central Library will remain open till 2 AM during exam period. Make the most of extended hours for preparation.',
        category: 'ANNOUNCEMENT',
        imageUrl: null,
        link: null,
        eventDate: now + (10 * oneDayMs),
        isPinned: false,
        venue: 'Central Library',
        priority: 3
      },
      {
        title: 'Hostel Maintenance - Water Supply',
        description: 'Water supply will be disrupted in Boys Hostel from 9 AM to 12 PM on Sunday for maintenance work. Please plan accordingly.',
        category: 'ANNOUNCEMENT',
        imageUrl: null,
        link: null,
        eventDate: now + (2 * oneDayMs),
        isPinned: false,
        venue: 'Boys Hostel',
        priority: 4
      },
      
      // WORKSHOP
      {
        title: 'Flutter App Development Bootcamp',
        description: '3-day intensive workshop on Flutter. Build your first mobile app! Limited seats. Registration fee: ₹200. Certificate provided.',
        category: 'WORKSHOP',
        imageUrl: 'https://placehold.co/400x200/02569B/ffffff?text=Flutter+Bootcamp',
        link: null,
        eventDate: now + (9 * oneDayMs),
        isPinned: false,
        venue: 'Lab 3',
        priority: 3
      },
      {
        title: 'Blockchain & Cryptocurrency Workshop',
        description: 'Understand the fundamentals of blockchain technology and cryptocurrencies. Learn about Web3, NFTs, and DeFi. Industry experts as speakers.',
        category: 'WORKSHOP',
        imageUrl: 'https://placehold.co/400x200/f7931a/ffffff?text=Blockchain',
        link: null,
        eventDate: now + (14 * oneDayMs),
        isPinned: false,
        venue: 'LT-2',
        priority: 3
      },
      
      // FEST
      {
        title: 'Tech Talk by Startup Founders',
        description: 'Alumni who founded successful startups share their journey. Learn about entrepreneurship, fundraising, and building products. Q&A session included.',
        category: 'FEST',
        imageUrl: 'https://placehold.co/400x200/607d8b/ffffff?text=Startup+Talk',
        link: null,
        eventDate: now + (11 * oneDayMs),
        isPinned: false,
        venue: 'Auditorium',
        priority: 4
      }
    ];
    
    // Add author information from existing users
    const buzzWithAuthors = campusBuzzData.map((buzz, index) => ({
      ...buzz,
      authorId: userIds[index % userIds.length],
      authorName: users[index % users.length].name,
      createdAt: now - (Math.random() * 3 * oneDayMs), // Created in last 3 days
      likes: new Set(),
      comments: []
    }));
    
    // Insert campus buzz
    await campusBuzzCollection.insertMany(buzzWithAuthors);
    console.log(`✅ Created ${buzzWithAuthors.length} campus buzz items`);
    
    console.log('\n🎉 Campus Buzz data populated successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   • Placement News: ${buzzWithAuthors.filter(b => b.category === 'PLACEMENT').length}`);
    console.log(`   • Cultural Events: ${buzzWithAuthors.filter(b => b.category === 'CULTURAL').length}`);
    console.log(`   • Technical Events: ${buzzWithAuthors.filter(b => b.category === 'TECHNICAL').length}`);
    console.log(`   • Sports Events: ${buzzWithAuthors.filter(b => b.category === 'SPORTS').length}`);
    console.log(`   • Announcements: ${buzzWithAuthors.filter(b => b.category === 'ANNOUNCEMENT').length}`);
    console.log(`   • Workshops: ${buzzWithAuthors.filter(b => b.category === 'WORKSHOP').length}`);
    console.log(`   • Fest News: ${buzzWithAuthors.filter(b => b.category === 'FEST').length}`);
    console.log(`   • Pinned Items: ${buzzWithAuthors.filter(b => b.isPinned).length}`);
    
  } catch (error) {
    console.error('❌ Error populating data:', error);
  } finally {
    await client.close();
    console.log('\n📦 Database connection closed.');
  }
}

populateCampusBuzzData();
