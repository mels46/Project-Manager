const Tasks=require("../models/task");
const User=require('../models/users');
const Day = require("../models/hoursPerDay");
const Project=require("../models/project");
const httpStatus=require("http-status-codes");
const token=process.env.TOKEN ||"managerT0k3n";
const mongoose=require('mongoose');
const Projects = require("../models/project");
module.exports= {
    getAllTasks: (req, res, next) => {
        Tasks.find()
            .then(tasks => {
                res.locals.tasks = tasks;
                next();
                console.log(tasks);
            }).catch(error => {
            console.log('Error fetching tasks');
            next(error);
        });
    },

    allTasksView: (req, res) => {
        if (req.query.format === 'json') {
            res.json(res.locals.tasks);
        } else {
            res.render("../views/TaskViews/allTasks", {title: "Svi zadaci"});
        }

    },
    newTaskV: (req, res) => {
        let projectId = req.params.projectId;
        console.log(projectId);
        res.render('TaskViews/addTask', {title: "Dodaj novi zadatak", projectId: projectId})
    },
    createNewTask: async (req, res, next) => {
        try {
            const radnik = await User.findOne({ email: req.body.radnik });
            const projekatId = req.params.projectId;

            if (!radnik) {
                return res.status(404).send("User not found");
            }

            const radnikId = radnik._id;
            const radnikIme = radnik.ime;

            if (req.skip) next();

            let newTask = new Tasks({
                naziv: req.body.naziv,
                opis: req.body.opis,
                projekat: projekatId,
                radnikId: radnikId,
                radnikIme: radnikIme,
            });

            // Spremanje novog zadatka u bazu podataka
            newTask.save()
                .then(async (task) => {
                    if (task) {
                        await Project.findByIdAndUpdate(
                            projekatId,
                            { $push: { radnici: radnikId } },
                            { new: true }
                        );

                        await User.findByIdAndUpdate(
                            radnikId,
                            { $push: { projektiID: projekatId } },
                            { new: true }
                        );
                        req.flash("success", `${task.naziv} uspešno kreiran`);
                        res.locals.redirect = `/task/${task._id}`;
                        next();
                    } else {
                        req.flash("error", "Failed to create task.");
                        res.locals.redirect = "/task/newTask";
                        next();
                    }
                })
                .catch((error) => {
                    console.log("Problem sa zadatkom", error);
                    req.flash("error", `Failed to create task because: ${error.message}`);
                    res.locals.redirect = "/task/newTask";
                    next();
                });


        } catch (error) {
            console.error("Error:", error);
            req.flash("error", `Can't create task because: ${error.message}`);
            res.locals.redirect = "/task/newTask";
            next();
        }
    },

    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    },
    editTask: (req, res, next) => {
        let taskId = req.params.id;
        Tasks.findById(taskId)
            .then(task => {
                res.locals.task = task;
                next();

            })
            .catch(error => {
                console.log("Ne postoji task sa tim id-em");
                next(error);
            });

    },
    respondJSON: (req, res) => {
        res.json({
            status: httpStatus.HTTP_STATUS_OK,
            data: res.locals
        });
    },
    errorJSON: (error, req, res, next) => {
        let errorObject;
        if (error) {
            errorObject = {
                status: httpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR,
                message: error.message
            };
        } else {
            errorObject = {
                status: httpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR,
                message: "inknown Error"
            };
        }
        res.json(errorObject);
    },
    editView: (req, res) => {
        if (req.query.format === 'json') {
            res.json(res.locals.task);
        } else {
            res.render("../views/TaskViews/editTask", {title: "Uredi task"});
        }

    },
    updateTask: (req, res, next) => {
        let taskId = req.params.id;
        let noviRadnik = User.findOne({email: req.body.radnik});
        let radnikId = noviRadnik._id;
        let radnikIme = noviRadnik.ime;

        taskParams = {
            naziv: req.body.naziv,
            opis: req.body.opis,

            radnikId: radnikId,
            radnikIme: radnikIme

        }
        Tasks.findByIdAndUpdate(taskId, {$set: taskParams})
            .then(task => {


                req.flash("success", `${task.naziv} updated successfully!`);

                res.locals.redirect = `http://localhost:3000/task/${taskId}`;
                res.locals.task = task;
                next();
            }).catch(error => {
            console.log("Nemoguce urediti ovaj task");
            req.flash("error", `Failed to update task because: ${error.message}`);

            next();
        });
    },
    showTask: async (req, res, next) => {
        let taskId = req.params.id;
        const days = await Day.find({taskId: taskId});
        let total = 0;
        days.forEach(day => {
            total = total + day.dnevnoSati;
        });
        res.locals.total = total;
        res.locals.days = days;
        Tasks.findById(taskId)
            .then(task => {
                res.locals.task = task;
                next();
            }).catch(error => {
            console.log("Ne postoji task sa tim id-em");
            next(error);
        });
    },
    showTaskView: (req, res) => {
        if (req.query.format === 'json') {
            res.json(res.locals.task);
        } else {
            res.render("../views/TaskViews/showTask", {title: "Zadatak"});
        }
    },
    deleteTask: async (req, res, next) => {
        let taskId = req.params.id;

        try {
            const task = await Tasks.findByIdAndDelete(taskId);

            if (task) {
                const projectWithTask = await Project.find({ zadaci: { $in: task._id }});

                const updateProjectPromises = projectWithTask.map(async (project) => {
                    project.zadaci = project.zadaci.filter(id => id.toString() !== taskId.toString());
                    await project.save();
                });

                await Promise.all(updateProjectPromises);

                req.flash("success", `${task.naziv} uspješno obrisan!`);
                res.locals.redirect = `http://localhost:3000/task/task`;
                next();
            } else {
                req.flash("error", "Project not found");
                res.locals.redirect = `http://localhost:3000/task/task`;
                next();
            }
        } catch (error) {
            console.log(`Neuspjelo brisanje zadatka: ${error.message}`);
            req.flash("error", `Neuspjelo brisanje zadatka: ${error.message}`);
            res.locals.redirect = `http://localhost:3000/task/task`;
            next();
        }
    },
    projectTasks: (req, res, next) => {

        const projectId = req.params.projectId;
        console.log(projectId);
        Tasks.find({projekat: projectId})
            .then(tasks => {
                res.locals.tasks = tasks;
                next();
            }).catch(error => {
            console.log(error, "Nemoguce dohvatitit zadatke za projekat");
        })
    },
    projectTasksView: (req, res) => {
        res.render('TaskViews/projectTasks', {title: "Zadaci na projektu"});
    },

}
