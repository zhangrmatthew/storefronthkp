const mongoose = require('mongoose');


const usersSchema = new mongoose.Schema({
  username: String,
  password: String
  });

const Users = mongoose.model("users", usersSchema);
module.exports = Users;
