const mongoose = require('mongoose');


const usersSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: Boolean
  });

const Users = mongoose.model("users", usersSchema);
module.exports = Users;
