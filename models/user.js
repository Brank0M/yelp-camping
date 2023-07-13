const mongoose = require("mongoose");  // Import Mongoose
const passportLocalMongoose = require("passport-local-mongoose");  // Import Passport Local Mongoose
const Schema = mongoose.Schema;  // Create a Schema variable

const UserSchema = new Schema({  // Create a new Schema
    email: {  // Create a new field called email
        type: String,  // Set the type to String
        required: true,  // Set the required field to true and set the error message
        unique: true  // Set the unique field to true
    }
});

UserSchema.plugin(passportLocalMongoose);  // Add Passport Local Mongoose plugin

module.exports = mongoose.model("User", UserSchema);  // Export the User model

