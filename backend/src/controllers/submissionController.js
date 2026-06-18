const Submission = require('../models/Submission');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

exports.create = async (req, res) => {
  try {
    const { taskId, textResponse } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    const isLate = new Date() > new Date(task.dueDate);
    const sub = await Submission.create({ task: taskId, student: req.user._id, textResponse, isLate });
    await Task.findByIdAndUpdate(taskId, { status: 'Submitted' });
    await Notification.create({ recipient: task.assignedBy, type: 'SUBMISSION_RECEIVED', title: 'New Submission', message: `${req.user.name} submitted "${task.title}"` });
    const io = req.app.get('io');
    if (io) io.to(`user_${task.assignedBy}`).emit('notification', { title: 'New Submission', message: `${req.user.name} submitted ${task.title}` });
    console.log(`Submission created for task: ${task.title}`);
    res.status(201).json({ success: true, data: { submission: sub }, message: 'Submitted successfully.' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.getPending = async (req, res) => {
  try {
    const subs = await Submission.find({ status: { $in: ['Submitted','Under Review'] } })
      .populate('task', 'title dueDate').populate('student', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: subs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.student = req.user._id;
    const subs = await Submission.find(filter)
      .populate('task', 'title dueDate').populate('student', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: subs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
