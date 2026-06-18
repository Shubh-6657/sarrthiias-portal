const User = require('../models/User');
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');

exports.stats = async (req, res) => {
  try {
    const [totalStudents, totalMentors, totalEvaluators, activeStudents, pendingEvaluations, completedEvaluations, totalTasks] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'evaluator' }),
      User.countDocuments({ role: 'student', isActive: true }),
      Submission.countDocuments({ status: { $in: ['Submitted','Under Review'] } }),
      Evaluation.countDocuments({}),
      Task.countDocuments({})
    ]);
    res.json({ success: true, data: { totalStudents, totalMentors, totalEvaluators, activeStudents, pendingEvaluations, completedEvaluations, totalTasks } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.perfDistribution = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }, 'stats.performanceStatus');
    const dist = { Excellent: 0, Good: 0, 'Needs Attention': 0, Critical: 0 };
    students.forEach(s => { if (dist[s.stats?.performanceStatus] !== undefined) dist[s.stats.performanceStatus]++; });
    res.json({ success: true, data: { distribution: dist } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.scoreTrend = async (req, res) => {
  try {
    const evals = await Evaluation.find().sort({ createdAt: 1 }).limit(30);
    const trend = evals.map(e => ({ date: e.createdAt.toISOString().split('T')[0], score: e.score }));
    res.json({ success: true, data: { trend } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.taskTrend = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: 1 }).limit(30);
    const trend = tasks.map(t => ({ date: t.createdAt.toISOString().split('T')[0], status: t.status }));
    res.json({ success: true, data: { trend } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.topStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ 'stats.averageScore': -1 }).limit(10);
    res.json({ success: true, data: { students } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
