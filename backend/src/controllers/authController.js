const jwt = require('jsonwebtoken');
const User = require('../models/User');

const makeTokens = (id) => ({
  accessToken:  jwt.sign({ id }, process.env.JWT_SECRET,         { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d'  }),
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required.' });

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account deactivated.' });

    const { accessToken, refreshToken } = makeTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    console.log(`Login: ${user.email} (${user.role})`);
    res.json({ success: true, message: 'Login successful', data: {
      accessToken, refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, stats: user.stats }
    }});
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token.' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    const tokens = makeTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.json({ success: true, data: tokens });
  } catch {
    res.status(401).json({ success: false, message: 'Token expired.' });
  }
};

exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
