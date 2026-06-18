const User = require('../models/User');

exports.getAll = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);
    res.json({ success: true, data: users, pagination: { total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getMyStudents = async (req, res) => {
  try {
    const filter = { role: 'student' };
    if (req.user.role === 'mentor') filter.mentor = req.user._id;
    const students = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor', isActive: true });
    res.json({ success: true, data: mentors });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: { user }, message: 'User created.' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true });
    res.json({ success: true, data: { user } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated.' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
