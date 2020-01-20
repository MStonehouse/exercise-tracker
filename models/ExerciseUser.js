const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// user schema
const ExerciseUserSchema = new Schema({
  username: {
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    minlength: 2
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('ExerciseUser', ExerciseUserSchema);