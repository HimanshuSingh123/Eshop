const mongoose = require("mongoose"); // helps implement mongodb application

// this is like an interface new products use to be made
const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  color: {
    type: String,
    required: true,
  },

  icon: {
    type: String,
    default: "",
  },
});

//model is the same thing as a collection, before we push anything
// from postman to add into a collection from mongoDB we must do this
// this model will contain column information of the product
//productSchema contains the object with columned info in it
exports.Category = mongoose.model("Category", categorySchema);
// exporting it above to products js (routers)
