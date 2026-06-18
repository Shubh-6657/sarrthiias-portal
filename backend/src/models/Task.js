const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  dueDate:     { type: Date, required: true },
  priority:    { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  status:      { type: String, enum: ['Pending','Submitted','Evaluated','Missed'], default: 'Pending' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
module.exports = mongoose.model('Task', taskSchema);
