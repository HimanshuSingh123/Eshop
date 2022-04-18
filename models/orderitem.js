const mongoose = require("mongoose"); // helps implement mongodb application

// this is like an interface new products use to be made
const orderItemSchema = mongoose.Schema({
  quantity: {
    //there are types of products but this is like a  product in your cart.thats why you can't just have just products.
    type: Number,
    required: true,
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
});

//model is the same thing as a collection, before we push anything
// from postman to add into a collection from mongoDB we must do this
// this model will contain column information of the product
//productSchema contains the object with columned info in it
exports.OrderItem = mongoose.model("OrderItem", orderItemSchema);
// exporting it above to products js (routers)
