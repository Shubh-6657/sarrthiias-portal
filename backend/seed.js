require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Task = require('./src/models/Task');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  await User.deleteMany({});
  await Task.deleteMany({});

  const admin = await User.create({ name: 'Super Admin', email: 'admin@sarrthiias.com', password: 'Admin@123', role: 'admin' });
  const mentor = await User.create({ name: 'Rajesh Kumar', email: 'mentor@sarrthiias.com', password: 'Mentor@123', role: 'mentor', mobile: '9876543210' });
  await User.create({ name: 'Priya Sharma', email: 'evaluator@sarrthiias.com', password: 'Eval@123', role: 'evaluator', mobile: '9876543211' });
  const s1 = await User.create({ name: 'Arjun Singh', email: 'student@sarrthiias.com', password: 'Student@123', role: 'student', mobile: '9876543212', targetYear: 2026, mentor: mentor._id, stats: { averageScore: 68, testsAttempted: 5, performanceStatus: 'Good' } });
  const s2 = await User.create({ name: 'Anita Verma', email: 'anita@sarrthiias.com', password: 'Student@123', role: 'student', mobile: '9876543213', targetYear: 2027, mentor: mentor._id, stats: { averageScore: 45, testsAttempted: 3, performanceStatus: 'Needs Attention' } });

  await Task.create({ title: 'Essay on Fundamental Rights', description: 'Write a 500-word essay on the importance of Fundamental Rights in Indian Constitution', dueDate: new Date(Date.now() + 7*24*60*60*1000), priority: 'High', assignedTo: s1._id, assignedBy: mentor._id });
  await Task.create({ title: 'Current Affairs Summary', description: 'Summarize top 10 current affairs from this week relevant to UPSC', dueDate: new Date(Date.now() + 3*24*60*60*1000), priority: 'Medium', assignedTo: s1._id, assignedBy: mentor._id });
  await Task.create({ title: 'Geography Map Practice', description: 'Mark all major rivers and their tributaries on the Indian map', dueDate: new Date(Date.now() + 5*24*60*60*1000), priority: 'Low', assignedTo: s2._id, assignedBy: mentor._id });

  console.log('\n✅ Seed complete!');
  console.log('===========================================');
  console.log('Admin:     admin@sarrthiias.com / Admin@123');
  console.log('Mentor:    mentor@sarrthiias.com / Mentor@123');
  console.log('Evaluator: evaluator@sarrthiias.com / Eval@123');
  console.log('Student1:  student@sarrthiias.com / Student@123');
  console.log('Student2:  anita@sarrthiias.com / Student@123');
  console.log('===========================================\n');
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
