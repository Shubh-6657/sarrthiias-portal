const mongoose = require('mongoose');
const studyPlanSchema = new mongoose.Schema({
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, default: Date.now },
  plan:          { type: Object, default: {} },
  rawText:       { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('StudyPlan', studyPlanSchema);
