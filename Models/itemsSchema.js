const mongoose = require('mongoose');


const itemsSchema = new mongoose.Schema({
  username: String,
  name: String,
  quantity: Number
  });



const Items = mongoose.model("items", itemsSchema);
module.exports = Items;
