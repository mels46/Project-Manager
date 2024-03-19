const mongoose=require("mongoose");
const projectSchema=new mongoose.Schema({
    naziv:{
        type:String,
        trim:true,
        unique:true,
    },
    opis:{type:String},
    startniDatum: {
        type: Date,
        validate: {
            validator: function (value) {

                return !this.zavrsniDatum || value < this.zavrsniDatum;
            },
            message: "Startni datum mora biti manji od završnog datuma."
        }
    },
    zavrsniDatum: {
        type: Date,
        validate: {
            validator: function (value) {
                return !this.startniDatum || value > this.startniDatum;
            },
            message: "Završni datum mora biti veći od startnog datuma."
        }
    },
    radnici:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    zadaci:[{type:mongoose.Schema.Types.ObjectId,ref:'Task'}],
    manager:{type:mongoose.Schema.Types.ObjectId,ref:'User'},


});
projectSchema.virtual('preostaloVrijeme').get(function () {
    const danasnjiDatum = new Date();
    const zavrsniDatum = this.zavrsniDatum;

    if (!zavrsniDatum || danasnjiDatum > zavrsniDatum) {
        return 0; // Ako završni datum nije postavljen ili je prošao, preostalo vreme je 0.
    }

    const razlikaUMilisekundama = zavrsniDatum - danasnjiDatum;
    const daniPreostali = razlikaUMilisekundama / (1000 * 60 * 60 * 24);

    return Math.round(daniPreostali);
});

const ProjectModel = mongoose.model('Project', projectSchema);

module.exports = ProjectModel;

