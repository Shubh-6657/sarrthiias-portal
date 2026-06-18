const Task = require('../models/Task');
const Notification = require('../models/Notification');

exports.getAll = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role === 'student') filter.assignedTo = req.user._id;
    if (req.user.role === 'mentor')  filter.assignedBy  = req.user._id;
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (search)   filter.title    = { $regex: search, $options: 'i' };
    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      Task.find(filter).populate('assignedTo assignedBy', 'name email').skip(skip).limit(+limit).sort({ createdAt: -1 }),
      Task.countDocuments(filter)
    ]);
    res.json({ success: true, data: tasks, pagination: { total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, assignedBy: req.user._id });
    // Real-time notification
    await Notification.create({ recipient: task.assignedTo, type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: `Task "${task.title}" assigned. Due: ${new Date(task.dueDate).toLocaleDateString()}` });
    const io = req.app.get('io');
    if (io) io.to(`user_${task.assignedTo}`).emit('notification', { title: 'New Task Assigned', message: task.title });
    console.log(`Task created: ${task.title}`);
    await task.populate('assignedTo assignedBy', 'name email');
    res.status(201).json({ success: true, data: { task }, message: 'Task assigned.' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { task } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted.' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
