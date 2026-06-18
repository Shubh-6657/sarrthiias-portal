const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['admin','mentor','evaluator','student'], default: 'student' },
  mobile:   { type: String, default: '' },
  targetYear: { type: Number },
  notes:    { type: String, default: '' },
  mentor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true },
  refreshToken: { type: String, select: false, default: null },
  stats: {
    attendancePercentage: { type: Number, default: 0 },
    testsAttempted:       { type: Number, default: 0 },
    averageScore:         { type: Number, default: 0 },
    lastEvaluationDate:   { type: Date, default: null },
    performanceStatus:    { type: String, enum: ['Excellent','Good','Needs Attention','Critical'], default: 'Good' }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(pw) {
  return require('bcryptjs').compare(pw, this.password);
};

module.exports = mongoose.model('User', userSchema);
