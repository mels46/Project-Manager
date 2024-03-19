const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const {Schema} = require("mongoose");
const project=require("../models/project");
const randToken=require("rand-token");

const userSchema=new mongoose.Schema({
    ime:{
                type:String,
                trim:true
    },
    prezime:{
                type:String,
                trim:true
    },

    email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true
    },
    projektiID:[
        {type:mongoose.Schema.Types.ObjectId,
            ref:'project'
        }
    ],
    status: {
        type: String,
        enum: ['radnik', 'menadžer', 'administrator'],
        default: 'radnik'
    }


    });


userSchema.pre("register",function(next){
    let user=this;
    if(!user.apiToken)
        user.apiToken=randToken.generate(16);
    next();
})

userSchema.plugin(passportLocalMongoose,{
    usernameField:"email"
})
userSchema.virtual("fullName")
    .get(function (){
        return `${this.ime} ${this.prezime}`;
    });



const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;

