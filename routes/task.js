const express = require('express');
const router = express.Router();
const taskController=require('../controllers/taskController');
const dayController=require('../controllers/hoursPerDayController');
const projectController=require('../controllers/ProjectController');

const Day = require("../controllers/hoursPerDayController");

router.get('/task', taskController.getAllTasks, function(req, res, next) {
    res.render('TaskViews/allTasks', { title: 'All Tasks'});
});
router.get('/newT/:projectId', taskController.newTaskV);

router.post('/newTask/:projectId',taskController.createNewTask,taskController.redirectView);
router.get('/project/:projectId',taskController.projectTasks,projectController.status,taskController.projectTasksView);
router.get('/allTasks',taskController.getAllTasks,taskController.allTasksView);
router.get("/:id",taskController.showTask,taskController.showTaskView);
router.get("/:id/newDay",dayController.createView);
router.post('/:id/new' ,dayController.create,dayController.redirectView);
router.get("/:id/editTask",taskController.editTask,taskController.editView);
router.put("/:id/updateTask",taskController.updateTask,taskController.redirectView);
router.delete("/:id/deleteTask",taskController.deleteTask,taskController.redirectView);

module.exports = router;