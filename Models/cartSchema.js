const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
  username: String,
  cart: [{item: String, price: Number, quantity: Number}]
  });

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
