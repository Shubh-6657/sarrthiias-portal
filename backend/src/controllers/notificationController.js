const Notification = require('../models/Notification');

exports.getAll = async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, data: { notifications: notifs, unreadCount } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked read.' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All marked read.' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
