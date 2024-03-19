const Hours=require('../models/hoursPerDay');
const mongoose=require('mongoose');
const Tasks=require('../models/task');
module.exports={
     getAll:(req,res,next)=>{
         Hours.find()
             .then(hours=>{
                 res.locals.hours=hours;
                 res.locals.redirect='hours/getALll';
                 next();

         })
             .catch(error=>{
                 console.log(error);
                 req.flash("Nemoguce provjeriti provedeno radno vrijeme tokom dana");
                 next();
             })
     },
    create: async(req,res,next)=>{
        try {
            console.log("Task Id create",req.params.id )
            const taskId=req.params.id;
            const status=req.body.status;
             await Tasks.findByIdAndUpdate(taskId,{ status: status })
            console.log("Task Id create",taskId )
            let dayParams = {
                taskId: taskId,
                danUSedmici: req.body.dan,
                dnevnoSati: req.body.dnevnoSati,
            };

            let newDay = new Hours(dayParams);
            newDay.save()
                .then(day => {
                    if (day) {
                        req.flash("success", `${day.danUSedmici} uspjesno kreiran`);
                        res.locals.redirect = `http://localhost:3000/task/${taskId}`;
                        next();
                    } else {
                        req.flash("error", `Failed to create day.`);
                        res.locals.redirect = `task/${taskId}/newDay`;
                        next();
                    }
                })
                .catch(error => {
                    console.log("Problem sa danom", error);
                    req.flash("error", `Failed to create day because: ${error.message}`);
                    res.locals.redirect = `task/${taskId}/newDay`;
                    next();
                });
        } catch (error) {
            console.error("Error:", error);
            req.flash("error", `Can't create day because: ${error.message}`);
            res.locals.redirect = `task/${taskId}/newDay`;
            next();
        }

    },

    createView:(req,res)=>{
        var taskId = req.params.id;
        console.log("Task za slanje",taskId);

        res.render("Day/addDay",{title:"Add day",taskId:req.params.id});
    },



    redirectView:(req,res,next)=>{
        let redirectPath=res.locals.redirect;
        if(redirectPath) res.redirect(redirectPath);
        else next();
    },

    update:(req,res,next)=>{
        let timeId=req.params.id;
        let day=req.body.dan;
        let time=req.body.vrijeme;

        let timeParams={
            danUSedmici:day,
            dnevnoSati:time

        }
        Hours.findByIdAndUpdate(set(timeParams))
            .then(req,res=>{
                console.log("Uspješno ažurirano vijeme");
                req.flash("Uspješno ažurirano vijeme");
                res.locals.redirect=`./time/{:id}`;
            }).catch(error=>{
             console.log("Error updating time");
             req.flash("Greška prilikom unošenja vremena provedenog na zadataku");
             res.locals.redirect=`./time/{:id}/update`;
            });

    },


}
