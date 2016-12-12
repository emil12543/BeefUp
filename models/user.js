const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const UserSchema = new Schema({
    name: String,
    age: Number
});

const User = Mongoose.model('User', UserSchema);