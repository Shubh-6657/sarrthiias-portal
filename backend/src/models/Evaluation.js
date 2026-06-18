const mongoose = require('mongoose');
const evaluationSchema = new mongoose.Schema({
  submission:    { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  task:          { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  evaluator:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score:         { type: Number, required: true, min: 0, max: 100 },
  strengths:     { type: String, default: '' },
  weaknesses:    { type: String, default: '' },
  suggestions:   { type: String, default: '' },
  aiSuggestions: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Evaluation', evaluationSchema);
