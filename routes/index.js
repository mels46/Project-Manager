const express = require('express');
const ProjectController = require("../controllers/ProjectController");
const userController=require("../controllers/UsersController");
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});


router.get('/task' ,function(req,res,next){
  res.render('TaskViews/task', {title:'Task:'});
});

router.get('/chat',userController.chat);
router.get('/project',ProjectController.getAllProjects );

module.exports = router;

