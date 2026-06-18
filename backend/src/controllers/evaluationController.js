const Evaluation = require('../models/Evaluation');
const Submission = require('../models/Submission');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.create = async (req, res) => {
  try {
    const { submissionId, score, strengths, weaknesses, suggestions } = req.body;
    const sub = await Submission.findById(submissionId).populate('task');
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const ev = await Evaluation.create({
      submission: submissionId, task: sub.task._id,
      student: sub.student, evaluator: req.user._id,
      score, strengths, weaknesses, suggestions
    });

    // Update submission status
    await Submission.findByIdAndUpdate(submissionId, { status: 'Evaluated' });
    await Task.findByIdAndUpdate(sub.task._id, { status: 'Evaluated' });

    // Update student stats
    const student = await User.findById(sub.student);
    const allEvals = await Evaluation.find({ student: sub.student });
    const avg = allEvals.reduce((a, e) => a + e.score, 0) / allEvals.length;
    let status = 'Excellent';
    if (avg < 75) status = 'Good';
    if (avg < 50) status = 'Needs Attention';
    if (avg < 30) status = 'Critical';
    await User.findByIdAndUpdate(sub.student, {
      'stats.averageScore': Math.round(avg),
      'stats.testsAttempted': allEvals.length,
      'stats.performanceStatus': status,
      'stats.lastEvaluationDate': new Date()
    });

    // Notify student
    await Notification.create({ recipient: sub.student, type: 'TASK_EVALUATED', title: 'Your Submission Evaluated', message: `Score: ${score}/100 for "${sub.task.title}"` });
    const io = req.app.get('io');
    if (io) io.to(`user_${sub.student}`).emit('notification', { title: 'Submission Evaluated', message: `Score: ${score}/100` });
    console.log(`Evaluation created: score ${score} for student ${sub.student}`);
    res.status(201).json({ success: true, data: { evaluation: ev }, message: 'Evaluated.' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student')   filter.student   = req.user._id;
    if (req.user.role === 'evaluator') filter.evaluator = req.user._id;
    const evals = await Evaluation.find(filter)
      .populate('student', 'name email').populate('evaluator', 'name')
      .populate('task', 'title').populate('submission')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: evals });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
