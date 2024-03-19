const mongoose=require('mongoose');

const hoursPerDaySchema=mongoose.Schema({
    taskId:{
        type: String,
        required:true
    },
    danUSedmici:
    {   type:String,
        enum: ['Ponedeljak', 'Utorak', 'Srijeda','Četvrtak','Petak','Subota','Nedelja'],
    },
    dnevnoSati:{
        type:Number,
            default:0
}
});

module.exports=mongoose.model("Hours",hoursPerDaySchema);