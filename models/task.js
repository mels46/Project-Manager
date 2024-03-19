const mongoose =require("mongoose");

  taskSchema=mongoose.Schema({
      naziv:{type: String, required:true, unique:true},
      opis:{type: String, required:true},
      projekat:{type:mongoose.Schema.Types.ObjectId,ref:'Project'},
      radnikId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
      radnikIme: {type:String},
      status:{
           type:String,
           enum: ['nezavršen', 'završen'],
           default: 'nezavršen'}

  });

taskSchema.methods.getInfo=function (){
    return `Naziv: ${this.naziv}. Opis: ${this.opis} `;
}

module.exports=mongoose.model("Task",taskSchema);