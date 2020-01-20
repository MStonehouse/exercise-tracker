const express = require('express');
const router = express.Router();
const exercise_controller = require('../controllers/exerciseController')



// Create new user
router.post('/new-user', exercise_controller.user_create_post)

// Add new exercise
router.post('/add', exercise_controller.add_exercise_post)

// Get exercise log
router.get('/log', exercise_controller.find_exercise_get)

// Get list of all users
router.get('/users', exercise_controller.all_users_get)



module.exports = router;