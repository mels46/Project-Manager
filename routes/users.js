const express = require('express');
const router = express.Router();
const UsersController=require('../controllers/UsersController');
const adminController=require('../controllers/adminController');

router.get('/' ,function(req,res,next){
    res.render('prijava', {title:'Prijava'});
});
router.get('/allUsers',adminController.getAllUsers,adminController.allUsersView);
router.get('/login',UsersController.login);
router.post('/login',UsersController.authenticate);
//UsersController.redirectView);
router.get('/logout',UsersController.logout,UsersController.redirectView);
router.get('/pocetna',UsersController.index,UsersController.indexView);
router.get('/signin',UsersController.signin);
router.post("/signin/create",UsersController.create,UsersController.redirectView);
router.get('/projects/:projectId',adminController.projectWorker,adminController.projectWorkerView);
router.post("/email_izvjestaj",adminController.izvjestaj);
//router.get("/izvjestaj",adminController.prikaziIzvjestaj);
router.get("/:id",UsersController.showUsersProjects,UsersController.workerView);
router.get("/:id/edit",UsersController.edit);
router.put("/:id/update",UsersController.update,UsersController.redirectView);
router.get("/:id/m",UsersController.show,UsersController.managerView);
router.get("/:id/m/projects",UsersController.showProject,UsersController.projectView);
router.get("/:id/a",adminController.getAllProjects,adminController. allProjectsView);

router.get("/:id/show",UsersController.show,UsersController.showView);

router.delete("/:id/delete",UsersController.delete,UsersController.redirectView);
router.delete("/:id/projects/:projectId/delete",adminController.deleteUserFromProject,adminController.redirectView);



module.exports = router;