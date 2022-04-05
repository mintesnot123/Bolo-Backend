// creating schema and model
const mongoosePaginate = require("mongoose-paginate-v2");

let mongoose = require("mongoose");
let validator = require("validator");
let Schema = mongoose.Schema;

//creating schema
let userSchema = new Schema({
    
    email: {
        type: String,        
        required: true,
        validate: (value) => {
            return validator.isEmail(value);
        },
    },
    contact_name: {
        type: String,
        required: true,
    },
    company_name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    answers: {
        type: Array,
        required: true,
    }
});

userSchema.plugin(mongoosePaginate);

//Creating model
let User = mongoose.model("Questions", userSchema, "questions");

module.exports = {
    User, // export the model
};
