import { db, statesTable, citiesTable, skillsTable, teamMembersTable, usersTable, groupsTable, eventsTable, expertiseTable } from "@workspace/db";
import bcrypt from "bcryptjs";

const EXPERTISE_LIST = [
  "Accountant", "Actor", "Actuary", "Advertising Specialist", "Agriculture Consultant", "AI Consultant", "AI Engineer", "AI Researcher", "Android Developer", "Animator", "App Developer", "Architect", "Art Director", "Artist", "Astronomer", "Athlete", "Attorney", "Audio Engineer", "Author", "Automation Specialist",
  "Backend Developer", "Baker", "Banker", "Behavioral Scientist", "Biologist", "Blockchain Developer", "Blogger", "Brand Manager", "Brand Strategist", "Business Analyst", "Business Consultant", "Business Developer", "Business Strategist",
  "Career Coach", "Cartographer", "Cartoonist", "Chef", "Chemical Engineer", "Choreographer", "Cinematographer", "Civil Engineer", "Cloud Engineer", "Coach", "Coder", "Communication Coach", "Community Manager", "Compliance Officer", "Composer", "Content Creator", "Content Strategist", "Copywriter", "Corporate Trainer", "Counselor", "Creative Director", "Creative Writer", "Criminologist", "Customer Success Manager", "Cybersecurity Specialist",
  "Data Analyst", "Data Engineer", "Data Scientist", "Database Administrator", "Debater", "Dentist", "Designer", "Developer", "DevOps Engineer", "Dietitian", "Digital Artist", "Digital Marketer", "Diplomat", "Documentary Filmmaker", "Drone Pilot",
  "Economist", "Editor", "Education Consultant", "Electrical Engineer", "Entrepreneur", "Environmental Consultant", "Environmental Scientist", "Ethical Hacker", "Event Manager",
  "Fashion Designer", "Film Director", "Film Producer", "Financial Advisor", "Financial Analyst", "Fitness Coach", "Food Blogger", "Food Scientist", "Frontend Developer", "Full Stack Developer", "Fundraising Specialist",
  "Game Designer", "Game Developer", "Graphic Designer", "Growth Marketer",
  "Historian", "HR Specialist",
  "Illustrator", "Industrial Designer", "Influencer", "Innovation Consultant", "Interior Designer", "Investment Analyst", "Investor",
  "Journalist",
  "Language Trainer", "Law Student", "Lawyer", "Leadership Coach", "Legal Consultant", "Life Coach", "Logistics Manager",
  "Machine Learning Engineer", "Management Consultant", "Manufacturer", "Market Researcher", "Marketing Manager", "Mechanical Engineer", "Mediator", "Mentor", "Mobile Developer", "Model", "Moderator", "Motion Designer", "Motivational Speaker", "Music Producer", "Musician",
  "Novelist", "Nurse", "Nutritionist",
  "Operations Manager",
  "Painter", "Paralegal", "Pharmacist", "Philosopher", "Photographer", "Physician", "Physicist", "Pilot", "Podcaster", "Poet", "Political Scientist", "Product Designer", "Product Manager", "Professor", "Programmer", "Project Manager", "Psychologist", "Public Relations Specialist", "Public Speaker",
  "QA Engineer",
  "Radiologist", "Real Estate Agent", "Recruiter", "Researcher", "Robotics Engineer",
  "Sales Manager", "Scientist", "Screenwriter", "Sculptor", "SEO Specialist", "Singer", "Social Entrepreneur", "Social Media Manager", "Social Worker", "Software Architect", "Software Developer", "Software Engineer", "Sound Designer", "Speech Therapist", "Sports Coach", "Startup Founder", "Statistician", "Stock Trader", "Storyteller", "Strategy Consultant", "Student", "Stylist", "Supply Chain Manager", "Surgeon", "System Administrator",
  "Tax Consultant", "Teacher", "Technical Writer", "Technology Consultant", "Therapist", "Translator", "Travel Blogger",
  "UI Designer", "UX Designer", "UX Researcher",
  "Venture Capitalist", "Veterinarian", "Video Editor", "Videographer", "Virtual Assistant", "Visual Designer", "Voice Artist",
  "Web Designer", "Web Developer", "Writer",
  "Yoga Instructor",
  "Zoologist",
];

async function seed() {
  console.log("Seeding database...");

  // States
  const states = await db.insert(statesTable).values([
    { name: "Maharashtra" },
    { name: "Delhi" },
    { name: "Karnataka" },
    { name: "Tamil Nadu" },
    { name: "Gujarat" },
    { name: "Rajasthan" },
    { name: "West Bengal" },
    { name: "Uttar Pradesh" },
    { name: "Telangana" },
    { name: "Madhya Pradesh" },
    { name: "Punjab" },
    { name: "Haryana" },
  ]).onConflictDoNothing().returning();
  console.log(`Seeded ${states.length} states`);

  const allStates = await db.select().from(statesTable);
  const stateMap = Object.fromEntries(allStates.map(s => [s.name, s.id]));

  // Cities
  const cities = await db.insert(citiesTable).values([
    { name: "Mumbai", stateId: stateMap["Maharashtra"], status: "ACTIVE" },
    { name: "Pune", stateId: stateMap["Maharashtra"], status: "ACTIVE" },
    { name: "Nagpur", stateId: stateMap["Maharashtra"], status: "UPCOMING" },
    { name: "New Delhi", stateId: stateMap["Delhi"], status: "ACTIVE" },
    { name: "Bengaluru", stateId: stateMap["Karnataka"], status: "ACTIVE" },
    { name: "Mysuru", stateId: stateMap["Karnataka"], status: "UPCOMING" },
    { name: "Chennai", stateId: stateMap["Tamil Nadu"], status: "ACTIVE" },
    { name: "Ahmedabad", stateId: stateMap["Gujarat"], status: "ACTIVE" },
    { name: "Surat", stateId: stateMap["Gujarat"], status: "UPCOMING" },
    { name: "Jaipur", stateId: stateMap["Rajasthan"], status: "ACTIVE" },
    { name: "Kolkata", stateId: stateMap["West Bengal"], status: "ACTIVE" },
    { name: "Lucknow", stateId: stateMap["Uttar Pradesh"], status: "ACTIVE" },
    { name: "Hyderabad", stateId: stateMap["Telangana"], status: "ACTIVE" },
    { name: "Bhopal", stateId: stateMap["Madhya Pradesh"], status: "UPCOMING" },
    { name: "Chandigarh", stateId: stateMap["Punjab"], status: "UPCOMING" },
    { name: "Gurugram", stateId: stateMap["Haryana"], status: "ACTIVE" },
  ]).onConflictDoNothing().returning();
  console.log(`Seeded ${cities.length} cities`);

  // Skills
  const skills = await db.insert(skillsTable).values([
    { name: "Web Development" },
    { name: "Graphic Design" },
    { name: "Video Editing" },
    { name: "Photography" },
    { name: "Content Writing" },
    { name: "Social Media Marketing" },
    { name: "Public Speaking" },
    { name: "Event Management" },
    { name: "UI/UX Design" },
    { name: "Data Science" },
    { name: "Mobile Development" },
    { name: "Entrepreneurship" },
    { name: "Music" },
    { name: "Dance" },
    { name: "Art & Illustration" },
    { name: "Finance" },
    { name: "Leadership" },
    { name: "Community Building" },
  ]).onConflictDoNothing().returning();
  console.log(`Seeded ${skills.length} skills`);

  // Expertise (Appendix A)
  const expertise = await db.insert(expertiseTable).values(EXPERTISE_LIST.map((name) => ({ name }))).onConflictDoNothing().returning();
  console.log(`Seeded ${expertise.length} expertise options`);

  // Team Members
  const teamMembers = await db.insert(teamMembersTable).values([
    { name: "Arjun Sharma", roleTitle: "Founder & CEO", section: "FOUNDER", displayOrder: 1, photoUrl: null, socialLinks: { instagram: "https://instagram.com/arjunsharma", linkedin: "https://linkedin.com/in/arjunsharma" } },
    { name: "Priya Patel", roleTitle: "Co-Founder & Head of Operations", section: "FOUNDER", displayOrder: 2, photoUrl: null, socialLinks: { linkedin: "https://linkedin.com/in/priyapatel" } },
    { name: "Rohan Mehta", roleTitle: "Head of Technology", section: "CORE", displayOrder: 3, photoUrl: null, socialLinks: { linkedin: "https://linkedin.com/in/rohanmehta" } },
    { name: "Ananya Iyer", roleTitle: "Head of Community", section: "CORE", displayOrder: 4, photoUrl: null, socialLinks: { instagram: "https://instagram.com/ananyaiyer" } },
    { name: "Kiran Reddy", roleTitle: "City Lead - Hyderabad", section: "CORE", displayOrder: 5, photoUrl: null, socialLinks: {} },
    { name: "Sneha Kulkarni", roleTitle: "Head of Events", section: "CORE", displayOrder: 6, photoUrl: null, socialLinks: {} },
    { name: "Dr. Vikram Nair", roleTitle: "Strategic Advisor", section: "ADVISOR", displayOrder: 7, photoUrl: null, socialLinks: { linkedin: "https://linkedin.com/in/drvikramnair" } },
    { name: "Ms. Lakshmi Bose", roleTitle: "Education Advisor", section: "ADVISOR", displayOrder: 8, photoUrl: null, socialLinks: {} },
  ]).onConflictDoNothing().returning();
  console.log(`Seeded ${teamMembers.length} team members`);

  // Admin user
  const adminHash = await bcrypt.hash("Admin@12345", 12);
  const adminUsers = await db.insert(usersTable).values([
    { name: "NetVent Admin", email: "admin@netvent.in", passwordHash: adminHash, role: "ADMIN" },
  ]).onConflictDoNothing().returning();
  console.log(`Seeded ${adminUsers.length} admin users`);

  // Groups
  const groups = await db.insert(groupsTable).values([
    { name: "Tech & Startups", description: "Discuss the latest in technology, share startup ideas, and connect with fellow tech enthusiasts." },
    { name: "Creative Arts", description: "A space for designers, photographers, musicians, and artists to share work and inspire each other." },
    { name: "Career & Internships", description: "Share opportunities, ask for advice, and help each other navigate career growth." },
    { name: "Sports & Fitness", description: "Stay active together — share workout tips, organize games, and motivate each other." },
    { name: "Campus Life", description: "Everything about college — tips, experiences, hostel life, and more." },
    { name: "Social Impact", description: "Youth-led initiatives, volunteering, and making a difference in our communities." },
  ]).onConflictDoNothing().returning();
  console.log(`Seeded ${groups.length} groups`);

  // Events
  const events = await db.insert(eventsTable).values([
    {
      title: "NetVent Parivaar Mumbai Meetup 2026",
      description: "Join us for our flagship Mumbai meetup where members come together to network, share ideas, and celebrate the NetVent community. Expect inspiring talks, collaborative workshops, and a whole lot of fun!",
      venue: "IIT Bombay, Powai, Mumbai",
      eventDate: new Date("2026-07-15T10:00:00Z"),
      status: "UPCOMING",
    },
    {
      title: "Bengaluru Youth Summit 2026",
      description: "A one-day summit for youth leaders and changemakers across Bengaluru. Panels, fireside chats, and networking sessions.",
      venue: "Christ University, Bengaluru",
      eventDate: new Date("2026-08-20T09:00:00Z"),
      status: "UPCOMING",
    },
    {
      title: "National Parivaar Day 2025",
      description: "Our biggest annual gathering where all chapters come together for a national celebration of community.",
      venue: "Indira Gandhi Indoor Stadium, New Delhi",
      eventDate: new Date("2025-12-10T09:00:00Z"),
      status: "PAST",
    },
    {
      title: "Hyderabad Chapter Launch",
      description: "The official launch of the NetVent Hyderabad chapter with founding members and community leaders.",
      venue: "Gachibowli, Hyderabad",
      eventDate: new Date("2025-11-05T11:00:00Z"),
      status: "PAST",
    },
  ]).onConflictDoNothing().returning();
  console.log(`Seeded ${events.length} events`);

  console.log("\n✅ Seed complete!");
  console.log("  Admin login: admin@netvent.in / Admin@12345");
}

seed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
