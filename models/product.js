const mongoose = require("mongoose"); // helps implement mongodb application

// this is like an interface new products use to be made
const productSchema = mongoose.Schema({
  name: {
    type: String,
    //refer to schemaTypes.
    required: true,
  },

  desc: {
    type: String,
    required: true,
  },

  richDesc: {
    type: String,
    // below is a default value for the string, and that will be it when a product is created
    default: "",
  },

  images: {
    type: String,
    default: "",
  },

  //the squarebrackets below refer to an array of strings
  image: [
    {
      type: String,
      default: "",
    },
  ],

  brand: {
    type: String,
    default: "",
  },

  price: {
    type: Number,
    default: 0,
  },

  category: {
    // when you want to add a product to a category, you need to link the
    // category ID to the product.
    // the link between the table of products and categories is the ID of category.
    type: mongoose.Schema.Types.ObjectId,
    // how would you say THIS is connected to categroes schema?
    // below.
    ref: "Category", // RELATIONIONAL DATA BASE SIMILARITY (BASICALLY?)
    required: true,
  },

  countInStock: {
    // if you need to make a component REQUIRED
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },

  numReviews: {
    type: Number,
    default: 0,
  },

  rating: {
    type: Number,
    default: 0,
  },

  isFeatured: {
    type: Boolean,
    default: false,
  },

  dateCreated: {
    type: Date,
    default: Date.now,
  },
});
// gets rid of the underscore in _id to make it more frontend friendly.
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productSchema.set("toJSON", {
  virtuals: true,
});

//model is the same thing as a collection, before we push anything
// from postman to add into a collection from mongoDB we must do this
// this model will contain column information of the product
//productSchema contains the object with columned info in it
exports.Product = mongoose.model("Product", productSchema);
// exporting it above to products js (routers)
