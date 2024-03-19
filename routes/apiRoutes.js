const express = require('express');
const router = express.Router();
const taskController=require('../controllers/taskController');
const userController=require('../controllers/UsersController');
const apiToken=process.env.TOKEN ||"managerT0k3n";

router.get('/tasks/:id',userController.loadTasks,userController.respondJSON,(res =>{
    console.log("pozvana ruta");
}));



router.use(taskController.errorJSON);

module.exports=router;
