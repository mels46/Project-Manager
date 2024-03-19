const createError = require('http-errors');
const express = require('express');
const path = require('path');
const expressSession=require("express-session");
const cookieParser = require('cookie-parser');
const connectFlash=require("connect-flash");
const logger = require('morgan');
const methodOverride=require("method-override");
const passport=require("passport");
const mongoose=require("mongoose");
const {connect} = require("mongoose");
const Users=require("./models/users");



const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const taskRouter=require('./routes/task');
const projectRouter=require('./routes/project');
const apiRouter=require('./routes/apiRoutes');
const dayRouter=require('./routes/day');
const {token} = require("morgan");
const http = require("http");





const app = express();
app.set("token",process.env.TOKEN || "managerT0k3n");

app.use(express.urlencoded({ extended: true }));//promijenjen na true




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());

//app.use(express.urlencoded({ extended: true }));//promijenjen na true
//app.use(layouts);
app.use(cookieParser("secret_passcode"));

app.use(expressSession({
    secret:"secret_passcode",
    cookie:{
        maxAge:4000000
    },
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

app.use(connectFlash());
app.use((req,res,next)=>{

    res.locals.flashMessages=req.flash();
    res.locals.loggedIn=req.isAuthenticated();
    res.locals.currentUser=req.user;
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/jquery',express.static(path.join(__dirname,'node_modules/jquery/dist')));



app.use(methodOverride("_method",{
    methods:["POST","GET"]
}));



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/task', taskRouter);
app.use('/project', projectRouter);
app.use('/api',apiRouter);
app.use('/day',dayRouter);
app.get("token");




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//konekcija

mongoose.connect(
    "mongodb://127.0.0.1/baza_projekat2",
    {
      useNewUrlParser:true,
      //useUnifiedTopology:true
    }
);
const db=mongoose.connection;

db.once("open",()=>{
  console.log("Successfuly connected!");
});

//var server = http.createServer(app);

module.exports = app;

