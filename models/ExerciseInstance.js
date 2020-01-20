const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// exercise schema
const ExerciseInstanceSchema = new Schema({
  userid: { type: String, required: true },
  description: {type: String, required: true, trim: true },
  duration: { type: Number, required: true, trim: true },
  date: { type: Date, required: true }
}, {
  timestamps: true
});



module.exports = mongoose.model('ExerciseInstance', ExerciseInstanceSchema);