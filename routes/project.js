const express = require('express');
const router = express.Router();
const ProjectController=require('../controllers/ProjectController');

router.get('/',ProjectController.getAllProjects,ProjectController.allProjectsView );
router.get('/new', function(req, res, next) {
    res.render('ProjectViews/addProject', { title: 'New Project'});
});
router.post('/newProject',ProjectController.createNewProject,ProjectController.redirectView);
router.get('/:id',ProjectController.showProject,ProjectController.showProjectView)
router.get("/:id/editProject",ProjectController.editProject,ProjectController.editView);
router.get('/:id/radniciNaProjektu',ProjectController.radniciNaProjektu,ProjectController.radniciView);
router.get('/:id/project_tasks',ProjectController.projectTasks,ProjectController.status,ProjectController.taskView);
router.put("/:id/updateProject",ProjectController.updateProject,ProjectController.redirectView);
router.delete("/:id/deleteProject",ProjectController.deleteProject,ProjectController.redirectView);



module.exports = router;

