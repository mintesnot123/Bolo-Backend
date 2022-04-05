// creating schema and model
const mongoosePaginate = require("mongoose-paginate-v2");

let mongoose = require("mongoose");
let validator = require("validator");
let Schema = mongoose.Schema;

//creating schema
let userSchema = new Schema({
    avatar: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    profession: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    numJob: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    languages: {
        type: Array,
        required: true,
    },
    experienceYear: {
        type: Number,
        required: true,
    },
    experienceLevel: {
        type: String,
        required: true,
        default: "Junior",
        enum: ["Junior", "Experienced"],
    },
});

userSchema.plugin(mongoosePaginate);

//Creating model
let User = mongoose.model("Developer", userSchema, "developers");

module.exports = {
    User, // export the model
};
