const Users=require("../models/users");
const Projects=require("../models/project");
const Tasks=require("../models/task");
const passport=require("passport");
const httpStatus = require("http-status-codes");
const jsonWebToken=require('jsonwebtoken');
module.exports= {
    index: (req, res, next) => {
        Users.find()
            .then(users => {
                res.locals.users = users;
                next();
            }).catch(error => {
            console.log('Error fetching users');
            next(error);
        });
    },
    indexView: (req, res) => {
        if (req.query.format === 'json') {
            res.json(res.locals.projects);
        } else {
            res.render("../views/UserViews/pocetna", {title: "Pocetna"});
        }
    },


    managerView:(req, res) => {
            res.render("../views/manager", {title: "Pocetna"})
    },

    adminView:(req, res) => {
        if (req.query.format === 'json') {
            res.json(res.locals.projects);
        } else {
            res.render("../views/admin", {title: "Pocetna"})
        }
    },

    signin:(req,res)=>{
        res.render("../views/UserViews/signin",{title:"Registracija"});
    },
    create:(req,res,next)=> {

        let status=req.body.status;
        if(!status){
            status="radnik";

        }
        if (req.skip) next();
        let userParams={

            ime:req.body.ime,
            prezime:req.body.prezime,
            email:req.body.email,
            status:status


        };
        let newUser = new Users(userParams);

        Users.register(newUser, req.body.password, (error, user) => {

            if (user) {
                req.flash("success", `${user.ime}'s account succesfully created`);
                res.locals.redirect = "/users/login";
                next();
            } else {
                req.flash("error", `Failed to create user because: ${error.message}`);
                res.locals.redirect = "/users/singin";
                next();
            }
        });
    },

    redirectView:(req,res,next)=>{
        let redirectPath=res.locals.redirect;
        if(redirectPath) res.redirect(redirectPath);
        else next();
    },
    show:(req,res,next)=>{
        let userId=req.params.id;
        console.log(userId);
        Users.findById(userId)
            .then(async user => {
                const projects = await Projects.find({manager: userId});
                let task = await Tasks.findOne({ projekat: projects._id, korisnik:userId});

                console.log(projects);
                res.locals.user = user;
                res.locals.projects=projects;
                res.locals.task=task;

                next();
            }).catch(error=>{
                console.log("Ne postoji korisnik sa tim imenom");
                next(error);
            });
    },
   loadTasks: async (req, res, next) => {
        try {
            let userId = req.params.id;


            let tasks = await Tasks.find({ radnikId: userId });

            res.locals.tasks = tasks;

            next();
        } catch (error) {
            console.log('Greška prilikom dohvatanja zadataka za korisnika:', error);
            next(error);
        }
    },

    respondJSON:(req,res)=>{
        res.json({
            status:httpStatus.HTTP_STATUS_OK,
            data:res.locals
        });
    },
    errorJSON:(error,req,res,next)=>{
        let errorObject;
        if(error){
            errorObject={
                status:httpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR,
                message:error.message
            };
        }else{
            errorObject={
                status:httpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR,
                message:"inknown Error"
            };
        }
        res.json(errorObject);
    },
    edit:(req,res,next)=>{
        let userId=req.params.id;
        Users.findById(userId)
            .then(user=>{

                res.render("UserViews/edit",{
                    title:"Edit",
                    user:user
                });
            }).catch(error=>{
                console.log("Ne postoji korisnik sa tim id-em");
                next(error);
        });
    },
    update:(req,res,next)=>{
        let userId=req.params.id;
        userParams={
            ime:req.body.ime,
            prezime:req.body.prezime,
            status:req.body.status,
            email:req.body.email,

        };
        Users.findByIdAndUpdate(userId,{$set:userParams})
            .then(user=>{

                req.flash("success",`${user.ime}'s account updated successfully!`);

                res.locals.redirect=`http://localhost:3000/users/${userId}`;
                res.locals.user=user;
                next();
            }).catch(error=>{
                console.log("Nemoguce urediti profil korisnika");
            req.flash("error",`Failed to update user account because: ${error.message}`);

            next();
        });
    },
    delete:(req,res,next)=>{
        let userId=req.params.id;
        Users.findByIdAndDelete(userId)
        .then(user=>{
            req.flash("success",`${user.ime}'s account deleted successfully!`);

            res.locals.redirect=`http://localhost:3000/users/allUsers`;
            next();
        })
            .catch(error=>{

                console.log(`Neuspjelo brisanje korisnika :${error.message}`);
                req.flash("error",`Failed to delete user account because: ${error.message}`);

                next();
            });
    },
    chat:(req, res)=>{
        res.render('chat');
    },
    login:(req,res)=>{
        res.render('UserViews/login',{title:'Login'});
    },
    logout:(req,res,next)=>{
        req.logout(function(err) {
                if (err) { return next(err); }});
        req.flash("success","Odjavili ste se!");
        res.locals.redirect="/users/login";
        next();
    },
   authenticate : passport.authenticate("local",{
        successRedirect:`/users/pocetna`,
        successFlash:"Logged in",
        failureRedirect:"/users/login",
        failureFlash:"Failed to login"

    }),




    showView:(req,res,next)=>{
        res.render("UserViews/show",{title:"Show"});
    },
    apiAuthenticate:(req,res,next)=>{
        passport.authenticate("local",(errors,user)=>{
            if(user){
                let signedToken=jsonWebToken.sign({
                    data:user._id,
                    exp:new Date.setDate(new Date().getDate()+1)
                },
                    "secret_encoding_passphrase");
                res.json({
                    success:true,
                    token:signedToken
                });
            }else res.json({
                success:false,
                message:"Couldn't authenticate user."
            });
            })(req,res,next);
        },
    verifyJWT:(req,res,next)=>{
        let token=req.headers.token;
        if(token){
            jsonWebToken.verify(
                token,
                "secret_encoding_passphrase",
                (errors,payload)=>{
                    if(payload){
                        Users.findById(payload.data).then(user=>{
                            if(user){
                                next();
                            }else{
                                res.status(httpStatus.FORBIDDEN).json({
                                    error:true,
                                    message:"No User account found."
                                });
                            }
                        });
                    }else{
                        res.status(httpStatus.UNAUTHORIZED).json({
                            error:true,
                            message:"Cannot verify API token."
                        });
                        next();
                    }
                }
                );
        }else{
            res.status(httpStatus.UNAUTHORIZED).json({
                error:true,
                message:'Provide Token'
            });
        }
    },
    showProject:async(req,res,next)=>{
        try {
            const manager = req.params.id;
            const projects = await Projects.find({manager: manager})
            res.locals.projects=projects;
            next();
        } catch(error){
            console.log(error, "Error fetching projects" );
        }

    },
    projectView:(req,res)=>{
        res.render('ProjectViews/allProjects',{title:"Managers projects"});
    },
    showUsersProjects: async (req, res, next) => {
        try {
            let userId = req.params.id;
            const user = await Users.findById(userId);

            if (!user) {
                console.log("Ne postoji korisnik sa tim id");
                return next(); // Dodao sam povratni poziv next() ako korisnik nije pronađen
            }

            const projects = await Projects.find({ radnici: { $in: [userId] } });

            const task = await Tasks.findOne({ projekat: { $in: user.projects }, korisnik: userId });

            res.locals.user = user;
            res.locals.projects = projects;
            res.locals.task = task;

            next();
        } catch (error) {
            console.error("Greška prilikom dohvatanja korisnikovih projekata:", error);
            next(error);
        }
    },


    workerView: (req, res) => {
        if (req.query.format === 'json') {
            res.json(res.locals.projects);
        } else {
            res.render("../views/worker", {title: "Pocetna"})
        }
    },
    }




