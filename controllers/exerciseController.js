const mongoose = require('mongoose');
const async = require('async');
const ExerciseUser = require('../models/ExerciseUser');
const ExerciseInstance = require('../models/ExerciseInstance');



// add user to the database
exports.user_create_post = function(req, res, next) {

  // Get username from req.body, get new id
  const newUser = req.body.username
  
  // Create new user
  const newExerciseUser = new ExerciseUser({
    username: newUser
  })
  
  // Save new user
  newExerciseUser.save(function(err, saveData) {
    if (err) { return next(err) };  
    
    res.json({username: saveData.username, _id: saveData._id })
      
  })
}



// add an exercise to the database
exports.add_exercise_post = function(req, res, next) {

  ExerciseUser.findOne({_id: req.body.userId}, function(err, data) {
    if (!data) {
      res.send('user not in database')
    } else {
      
      // clean up user data
      const usr = req.body.userId;
      const desc = req.body.description;
      const dur = req.body.duration;
      const edate = req.body.date === '' ? new Date() : Date.parse(req.body.date);
      
      // check if date is valid, if not send error
      if (isNaN(edate)) {
        next(new Error('Invalid Date'));
      } 
      
      // make user instance
      const newExerciseInstance = new ExerciseInstance({
        userid: usr,
        description: desc,
        duration: dur,
        date: edate,
      })
      
      // save user instance
      newExerciseInstance.save(function(err, saveData) {
        if (err) { return next(err) };  
          
        res.json({
          username: data.username,
          description: saveData.description,
          duration: saveData.duration,
          _id: data._id,
          date: new Date(edate).toDateString()
        })
        
      })
    }
  })
}



// get exercise log from database
exports.find_exercise_get = function (req, res, next) {
  
  // new Date(-8640000000000000) is oldest date allowed by javascript
  let gtDate;
  let ltDate;
  
  // date validation for 'fromDate'
  if (req.query.fromDate === '') { // if date empty set to oldest date allowed by javascript
    gtDate = new Date(-8640000000000000);
  } else if (isNaN(Date.parse(req.query.fromDate))) {  
    return next(new Error('Invalid From Date'));  
  } else {
    gtDate = new Date(req.query.fromDate)
  }
  
  // date validation for 'toDate'
  if (req.query.toDate === '') { 
    ltDate = new Date()
  } else if (isNaN(Date.parse(req.query.toDate))) {  
    return next(new Error('Invalid To Date'));  
  } else {
    ltDate = new Date(req.query.toDate)
  }
  
  async.parallel({
    user: function(callback) {
      ExerciseUser.findById(req.query.userId)
        .select('-createdAt')
        .select('-updatedAt')
        .select('-__v')
        .exec(callback);
    },
    exercise: function(callback) {
      ExerciseInstance.find({userid: req.query.userId})
        .lean()
        .where('date').gte(gtDate).lte(ltDate)
        .limit(Number(req.query.limit))
        .select('-userid')
        .select('-_id')
        .select('-createdAt')
        .select('-updatedAt')
        .select('-__v')
        .sort({date: -1})
        .exec(callback);
    }
  }, function(err, data) {
    
    // change date of all exercise instances to a more readable format
    if (!!data.exercise.length) {
      data.exercise.forEach((v, i) => data.exercise[i].date = v.date.toDateString())
    }
    
    // basic structure of the return object
    let returnObject = {
      _id: data.user._id, 
      username: data.user.username
    };
    
    // if 'fromDate' add it to the return object
    req.query.fromDate === '' ? null : returnObject.from = new Date(req.query.fromDate).toDateString();
    
    // if 'toDate' add it to the return object
    req.query.toDate === '' ? null : returnObject.to = new Date(req.query.toDate).toDateString();
    
    // add count to return object
    returnObject.count = data.exercise.length;
    
    // add log array to the return object
    returnObject.log = data.exercise
    
    // respond to user with returnObject
    res.json(returnObject)
  })
  
}



// get all users from database
exports.all_users_get = function(req, res, next) {

  ExerciseUser.find({})
    //.lean()
    .select('-createdAt')
    .select('-updatedAt')
    .exec(function(err, data) {
      if (err) { return next(err) }
    
      res.send(data)
  })
  
}