const mongoose = require("mongoose"); // helps implement mongodb application

// this is like an interface new products use to be made
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  passHash: {
    type: String,
    required: true,
  },

  street: {
    type: String,
    default: "",
  },

  apartment: {
    type: String,
    default: "",
  },

  city: {
    type: String,
    default: "",
  },

  zip: {
    type: String,
    default: "",
  },

  country: {
    type: String,
    default: "",
  },

  phone: {
    type: String,
    required: true,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// gets rid of the underscore in _id to make it more frontend friendly.
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

//model is the same thing as a collection, before we push anything
// from postman to add into a collection from mongoDB we must do this
// this model will contain column information of the product
//productSchema contains the object with columned info in it
exports.User = mongoose.model("User", userSchema);

// exporting it above to products js (routers)
