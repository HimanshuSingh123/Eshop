// double . below (..) gives access to all children no matter how deep
const { Category } = require("../models/category"); // connects to product file in module so APIs can use that "interface"
const express = require("express"); //express used to host server (loibrary)
const router = express.Router(); // resposible for storing APIs, creating them, and transproting them between files
// router can also be used with middleware

// since app.use(`${api}/products`, productsRouter)
// already sets and API and mentions this file, you just
// need to put a / because the API is already mentioned,
// unless you're wanting to go for a specific API
// when you want an API focusing on count so you could put
// '/count' instead of /
router.get(`/`, async (req, res) => {
  // async and await require because productList will wait and be filled then go on to the next line
  const categoryList = await Category.find(); // finds the exact model in the database with those parameters (I think)
  // waiting done then push out
  if (!categoryList) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});

router.get("/:categoryID", async (req, res) => {
  const category = await Category.findById(req.params.categoryID);

  if (!category) {
    return res
      .status(500)
      .json({ success: false, message: "ID couldn't be found" });
  }
  return res.status(200).json({ success: true, message: "id found", category });
});

//updating category
router.put("/:categoryID", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    //id has to match
    req.params.categoryID,
    //contains updated data
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.icon,
    },
    { new: true } // nodeJS basically returns original data to the user, but updates the databse. if you want new data returned you have to add this.
  );
  // if you get category you update it above, if not just do the following below.

  if (!category) return res.status(400).json({ message: "category not found" });

  return res.status(200).json({ message: "id found and updated", category });
});

// adding a category
router.post("/", async (req, res) => {
  // let because it's a variable
  let category = new Category({
    //new object being made here (refer to mongoose.model/productschema)
    name: req.body.name,
    color: req.body.color,
    icon: req.body.icon,
  });
  // don't need to .then() and .catch() with await
  category = await category.save();

  if (!category)
    // if the above statement fails..
    return res.status(404).sendStatus("Category cannot be created");

  res.send(category);
});

// deleting category
// a good way to delete something is by putting the ID in the URL.
//eg api/v1/asdasdasdasd
router.delete("/:CategoryID", async (req, res) => {
  // req.params.CategoryID, CategoryID has to be the same in below.
  // return has a promise, if category is found and if it isnt
  //Category.findByIdAndRemove(req.params.CategoryID)

  try {
    const category = await Category.findByIdAndDelete(req.params.CategoryID);

    // params. An object containing parameter values parsed from the URL path. For example if you have the route /user/:name ,
    //then the "name" from the URL path wil be available as req.params.name .

    if (category) {
      return res
        .status(200)
        .json({ success: true, message: "category is deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
  } catch {
    // what if there is an error in the server, in the connectionn or something like that
    return res
      .status(400)
      .json({ success: false, message: "category failed, server error" });
  }
});

module.exports = router;
