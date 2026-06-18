const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  task:         { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  textResponse: { type: String, required: true },
  status:       { type: String, enum: ['Submitted','Under Review','Evaluated'], default: 'Submitted' },
  isLate:       { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Submission', submissionSchema);
