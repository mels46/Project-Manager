const Projects=require("../models/project");
const User=require('../models/users');
const Task = require("../models/task");
const Days=require("../models/hoursPerDay");
const nodemailer=require('nodemailer');
const passport=require('passport');

module.exports={
    getAllProjects: (req,res,next)=>{
        Projects.find()
            .then(projects=>{
                res.locals.projects=projects;
                next();
            }).catch(error=>{
            console.log('Error fetching projects');
            next(error);
        });
    },
    allProjectsView:(req,res)=>{
        res.render("../views/ProjectViews/allProjects.ejs",{title:"Svi projekti:"});
    },
    createNewProject: async (req, res, next) => {
        try {
            const radniciEmails = req.body.radnici.split(',');
            const radnici = await User.find({ email: { $in: radniciEmails } });
            const managerEmail=req.body.manager;
            console.log(managerEmail);
            const  manager=await User.findOne({email:managerEmail});
            const managerId=manager._id;
            //slanje maila

           /* const sendEmail = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: managerEmail,
                    pass: manager.hash
                        },
                secure: true
            });

            const emailPromises = radnici.map(radnik => {
                const emailOptions = {
                            from: managerEmail,
                            subject: "Dodani ste na novi projekat.",
                            text: `Poštovani, dodani ste na novi projekat: "${req.body.naziv}".`,
                            to: radnik.email
                        };
                        return sendEmail.sendMail(emailOptions);
                    });

            await  Promise.all(emailPromises)


*/
//kraj
            //console.log(typeof (manager));

            const radniciIds = radnici.map(radnik => radnik._id);

            let projectParams = {
                naziv: req.body.naziv,
                opis: req.body.opis,
                radnici: radniciIds,
                startniDatum: req.body.startniDatum,
                zavrsniDatum: req.body.zavrsniDatum,
                manager:managerId,
            };

           let newProject = new Projects(projectParams);
             newProject.save()
                 .then(project => {
                    if (project) {
                        req.flash("success", `${project.naziv} uspješno kreiran`);
                        res.locals.redirect = `/project`;
                        const updateUserPromises = radniciIds.map(radnikID => {
                            return User.findByIdAndUpdate(
                                radnikID,
                                { $push: { projektiID: project._id } },
                                { new: true }
                            );
                        });

                        return Promise.all(updateUserPromises);

                    }
                })
                 .then(updatedUsers => {
                     console.log('Ažurirani korisnici:', updatedUsers);

                     next();
                 })
                 .catch(error => {
                     req.flash("error", `Failed to create project because: ${error.message}`);
                     res.locals.redirect = "/project/newProject";
                     next();
                 });
        } catch (error) {
            console.error("Error:", error);

            req.flash("error", `Can't create project because: ${error.message}`);
            res.locals.redirect = "/project/newProject";
            next();
        }
    },

    newView:(req,res)=>{
        res.render("../views/ProjectViews/addProject",{title:"Kreiraj projekat"});
    },


    redirectView:(req,res,next)=>{
        let redirectPath=res.locals.redirect;
        if(redirectPath) res.redirect(redirectPath);
        else next();
    },
    editProject:(req,res,next)=>{
        let projectId=req.params.id;
        Projects.findById(projectId)
            .then(project=>{
                res.locals.project=project;
                next();

            })
            .catch(error=>{
                console.log("Ne postoji projekat sa tim id-em") ;
                next(error);
            });

    },
    editView:(req,res)=>{
        res.render("../views/ProjectViews/editProject.ejs",{title:"Uredi projekat"});
    },

    updateProject : async (req, res, next) => {
        try {
            let projectId = req.params.id;
            const radniciEmails = req.body.radnici.split(',');
            const radnici = await User.find({ email: { $in: radniciEmails } });
            const radniciIds = radnici.map(radnik => radnik._id);




            let projectParams = {
                naziv: req.body.naziv,
                opis: req.body.opis,
                startniDatum: req.body.startniDatum,
                zavrsniDatum: req.body.zavrsniDatum,
                radnici:radniciIds

            };

            Projects.findByIdAndUpdate(projectId, { $set: projectParams }, { new: true })
                .then(project => {
                    req.flash("success", `${project.naziv} updated successfully!`);
                    res.locals.redirect = `http://localhost:3000/project/${projectId}`;
                    res.locals.project = project;
                    const updateUserPromises = radniciIds.map(radnikID => {
                        return User.findByIdAndUpdate(
                            radnikID,
                            { $push: { projektiID: project._id } },
                            { new: true }
                        );
                    });
                    return Promise.all(updateUserPromises);

                    next();
                })
                .then(updatedUsers => {
                    console.log('Ažurirani korisnici:', updatedUsers);

                    next();
                })
                .catch(error => {
                    console.log("Failed to update this project");
                    req.flash("error", `Failed to update project because: ${error.message}`);
                    next();
                });
        } catch (error) {
            console.error("Error:", error);
            req.flash("error", `Failed to update project because: ${error.message}`);
            next();
        }
    },



    showProject:(req,res,next)=>{
        let projectId=req.params.id;
        Projects.findById(projectId)
            .then(project=>{

                res.locals.project=project;
                next();
            }).catch(error=>{
            console.log("Ne postoji projekat sa tim id-em");
            next(error);
        });
    },
    showProjectView:(req,res)=>{
        res.render("../views/ProjectViews/showProject",{title: "Project"});
    },
    projectTasks: async (req, res, next) => {
        try {
            let projectId = req.params.id;
            let tasks = await Task.find({ projekat: projectId });

            let total=0;
            res.locals.tasks = tasks;
            next();
        } catch (error) {
            console.log("Nemoguće dohvatiti taskove projekta:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    taskView:(req,res)=>{
        res.render('TaskViews/projectTasks',{title:"Zadaci projekta"});
    },

    deleteProject :async (req, res, next) => {
        let projectId = req.params.id;

        try {
            const project = await Projects.findByIdAndDelete(projectId);

               if (project) {
                    const usersWithProject = await User.find({ projektiID: { $in: project._id }});

                const updateUserPromises = usersWithProject.map(async (user) => {
                    user.projektiID = user.projektiID.filter(id => id.toString() !== projectId.toString());
                    await user.save();
                });

                await Promise.all(updateUserPromises);

                req.flash("success", `${project.naziv} uspješno obrisan!`);
                res.locals.redirect = `http://localhost:3000/project/`;
                next();
            } else {
                req.flash("error", "Project not found");
                res.locals.redirect = `http://localhost:3000/project/`;
                next();
            }
        } catch (error) {
            console.log(`Neuspjelo brisanje projekta: ${error.message}`);
            req.flash("error", `Failed to delete project because: ${error.message}`);
            res.locals.redirect = `http://localhost:3000/project/`;
            next();
        }
    },

    radniciNaProjektu: async (req, res, next) => {
        try {
            let projekatID = req.params.id;
            let radnici = await User.find({ projektiID: { $in: [projekatID] } });
             console.log(radnici);
            res.locals.radnici = radnici;
            next();
        } catch (error) {
            console.log("Greška prilikom pretrage radnika na projektu:", error);

        }
    },

    radniciView:(req,res)=>{
        res.render("ProjectViews/radniciNaProjektu",{title:"Radnici na projektu"});
    },
    status: async (req, res, next) => {
        try {
            let projectId = req.params.id;
            let project = await Projects.findById(projectId);
            let tasks = await Task.find({ projekat:projectId});

            let zavrsenih = 0, ukupno = 0, ukupanBrojSati = 0;

            for (const task of tasks) {
                if (task.status === "završen") {
                    zavrsenih = zavrsenih + 1;
                }
                ukupno = ukupno + 1;

                const days = await Days.find({ taskId: task._id });

                for (const day of days) {
                    ukupanBrojSati = ukupanBrojSati + day.dnevnoSati;
                }
            }

            console.log(ukupno);
            let postotak1 = (zavrsenih / ukupno) * 100;
            if (isNaN(postotak1)) postotak1 = 0;
            console.log("Postotak", postotak1);
            let postotak=postotak1.toFixed(2);

            res.locals.zavrseni = zavrsenih;
            res.locals.postotak = postotak;
            res.locals.sati = ukupanBrojSati;
            next();
        } catch (error) {
            console.error("Error in status middleware:", error);
            next(error);
        }
    }





}
