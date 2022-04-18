const mongoose = require("mongoose"); // helps implement mongodb application

// this is like an interface new products use to be made
const orderSchema = mongoose.Schema({
  orderItems: [
    //explaination part55
    {
      // in an array because you can have multiple orderitems

      type: mongoose.Schema.Types.ObjectId,
      // how would you say THIS is connected to orderitems schema?
      // below.
      ref: "OrderItem", // RELATIONIONAL DATA BASE SIMILARITY (BASICALLY?)
      required: true,
    },
  ],

  shippingAddress1: {
    type: String,
    required: true,
  },

  shippingAddress2: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  zip: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    required: true,
    default: "pending",
  },

  totalPrice: {
    type: Number,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});
orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

//model is the same thing as a collection, before we push anything
// from postman to add into a collection from mongoDB we must do this
// this model will contain column information of the product
//productSchema contains the object with columned info in it
exports.Order = mongoose.model("Order", orderSchema);
// exporting it above to products js (routers)
