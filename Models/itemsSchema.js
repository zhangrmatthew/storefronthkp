const mongoose = require('mongoose');


const itemsSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  photos: [String]
  });



const Items = mongoose.model("items", itemsSchema);
module.exports = Items;
