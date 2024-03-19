const Project= require("../models/project");
const User=require("../models/users");
const  Task=require("../models/task");
const Day=require("../models/hoursPerDay");

module.exports={
    getAllProjects: async (req, res, next) => {
        try {
            const userID = req.params.id;

            const user = await User.findById(userID);
            res.locals.user = user;

            const projects = await Project.find();
            res.locals.projects = projects;

            next();
        } catch (error) {
            console.log('Error fetching user or projects:', error);
            next(error);
        }
    },

    allProjectsView:(req,res)=>{
        res.render("../views/admin",{title:"Svi projekti:"});
    },
    getAllUsers:(req,res,next)=>{
        User.find()
            .then(users => {
                res.locals.users = users;
                next();
            }).catch(error => {
            console.log('Error fetching users');
            next(error);
        });
    },
    allUsersView:(req,res)=>{
        res.render("UserViews/allUsers",{title:"Svi radnici"});
    },
    projectWorker: async (req, res, next) => {
        try {

            const projectId = req.params.projectId;
            console.log(projectId);
            const users = await User.find({ projektiID: { $in: [projectId] } });
            res.locals.users = users;
            res.locals.projectId=projectId;
            next();
        }catch (error) {
            console.log(error, "Error fetching project users")

        }
        },
    projectWorkerView:(req,res)=>{
        res.render("UserViews/projectUsers",{title:"Radnici na projektu"});
    },
    deleteUserFromProject: async (req, res, next) => {
        try {
            const userId = req.params.id;
            const projectId = req.params.projectId;


            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { $pull: { projektiID: projectId } },
                { new: true }
            );

            console.log("User successfully updated.", updatedUser);

            const project = await Project.findById(projectId);

            await Promise.all(
                project.zadaci.map(async (task) => {
                    const updatedTask = await Task.findOneAndUpdate(
                        { projekat: projectId, radnik:userId },
                        { $pull: { radnici: userId } },
                        { new: true }
                    );

                })
            );
            const updatedProject = await Project.findByIdAndUpdate(
                projectId,
                { $pull: { radnici: userId } },
                { new: true }
            );

            console.log(`User ${userId} deleted from project ${updatedProject._id}`);


            res.req.flash("success", `User deleted from project `);
            res.locals.redirect=`http://localhost:3000/users/projects/${projectId}`;
            next();
        } catch (error) {
            console.error('Error deleting user', error);
            next(error);
        }
    },

    izvjestaj: async(req,res,next)=>{
        try {
            const email = req.body.email;
            const user =await User.findOne({email: email});
            const userId=user._id;
            const projects= await Project.find({radnici:{ $in: [userId] }});
            const tasks= await Task.find({radnikId:userId});
            const taskIds = tasks.map(task => task._id);
            const dani = await Day.find({ taskId: { $in: taskIds } });
            let ukupnoDana=dani.length;
            let ukupnoSati=0;
            let p=ukupnoSati/ukupnoDana;
            let prosjek=p.toFixed(2);
            dani.forEach(dan=>{
                ukupnoSati=ukupnoSati+dan.dnevnoSati;
            })

            res.locals.user = user;
            res.locals.projects=projects;
            res.locals.tasks=tasks
            res.locals.ukupnoDana=ukupnoDana;
            res.locals.ukupnoSati=ukupnoSati;
            res.locals.prosjek=prosjek;
            res.locals.redirect = "/users/izvjestaj"
            res.render("UserViews/izvjestaj",
                {title:"Izvještaj",
                    user:user,
                    ukupnoSati:ukupnoSati,
                    ukupnoDana:ukupnoDana,
                    prosjek:prosjek,
                    projects:projects,

                    tasks:tasks
                });

        } catch(error)  {
                console.error('Error fetching user:', error);
        }
        },
    redirectView:(req,res,next)=>{
        let redirectPath=res.locals.redirect;
        if(redirectPath) res.redirect(redirectPath);
        else next();
    },

}