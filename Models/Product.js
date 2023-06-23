const mongoose = require('mongoose');
const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"]
  },
  stock: {
    type: Number,
    required: [true, "can't be blank"]
  },
  price: {
    type: String,
    required: [true, "can't be blank"]
  },
  category: {
    type: String,
    required: [true, "can't be blank"]
  },
  pictures: {
    type: String,
    default:""
  }
}, {minimize: false});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;