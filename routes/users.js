const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/pintrest')
    .then(() => {
        console.log("Connected to database");
    })
    .catch((err) => {
        console.log("Error connecting to database");
        console.log(err);
    });

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    profilePic: String,
    contact: Number,
    boards: {
        type: Array,
        default: []
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

userSchema.plugin(plm);


const User = mongoose.model("User", userSchema);

module.exports = User;