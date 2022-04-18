//product in {} because it returns an object of multiple attributes called "object destrucring" (https://www.javascripttutorial.net/es6/javascript-object-destructuring/)
// double . below (..) gives access to all children no matter how deep
const { Product } = require("../models/product"); // connects to product file in module so APIs can use that "interface"
const express = require("express"); //express used to host server (loibrary)
const { Category } = require("../models/category");
const router = express.Router(); // resposible for storing APIs, creating them, and transproting them between files
// router can also be used with middleware

const mongoose = require("mongoose");
const { request } = require("express");

const multer = require("multer");

const authorized_extensions = {
  // list of extenions that are allowed to be uploaded to backend.
  "image/png": "png", // this format occurs because of MIME type. It's a media type (multipurpose internet mail extensions)
  // this is a standard that indicates the nature and format of a document.
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  // presents a more dynamic way of saving pictures. single uploads have a risk of saving over an already existing image.
  destination: function (req, file, cb) {
    const isValid = authorized_extensions[file.mimetype]; // this will see if the mimetype is in authorized_exnteisons, if not it will fire an error.
    let uError = new Error("invalid img type");

    if (isValid) {
      //if not invalid image type, make error null.
      uError = null;
    }

    cb(uError, "public/uploads"); //call back will be retruend if there is an error with a destination returned in it
  },
  filename: function (req, file, cb) {
    //file data is mime type here. refer to authorized extensions above.

    const fileName = file.originalname.replace(" ", "-");
    const extension = authorized_extensions[file.mimetype];
    //file.mimetype will include the information or the file information with the extensions of mimetype in authorized_extensions.
    // it will assign one of the authorized_extensions as an extension.
    cb(null, `${fileName}-${Date.now()}.${extension}`);
    //  "http://localhost:3000/public/upload/download.jfif-1650217989701" that is what you got before the refactoring with extension above.
  },
});

const uploadOptions = multer({ storage: storage }); //upload configuration. this gets passed into requests that need it.

// since app.use(`${api}/products`, productsRouter)
// already sets and API and mentions this file, you just
// need to put a / because the API is already mentioned,
// unless you're wanting to go for a specific API
// when you want an API focusing on count so you could put
// '/count' instead of /
router.get(`/`, async (req, res) => {
  // http://localhost:3000/api/v1/products?categories=232132323,232323
  // the ? above mentions that it's a query
  let filter = {}; // js doesnt allow for using variables outside if statements so this had to be made
  // just let filter = [] forces API to have a category so with just that you get nothing because, so make it as an empty object instead

  if (req.query.categories) {
    // if a query is there in the link then...
    filter = { category: req.query.categories.split(",") }; // add all categories to filter list and split them by commmas
  }

  const productList = await Product.find(filter); // finds thorugh list based on categories in the database with those parameters
  // waiting done then push out
  if (!productList) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.get(`/:productID`, async (req, res) => {
  // async and await require because productList will wait and be filled then go on to the next line

  const product = await Product.findById(req.params.productID).populate(
    "category" // RELATIONIONAL DATA BASE SIMILARITY (BASICALLY?)
  );
  //populate means any connected ID or field to another table will be displayed as detail in this field (in this case the respective category)
  // waiting done then push out
  if (!product) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  const category = await Category.findById(req.body.category);
  if (!category)
    return res.status(400).json({
      message: "category doesn't exist or wasn't set for this product",
      product,
    });

  res.send(product);
});

// what if the user or the admin of the application of the eshop
// will send or for example create a new product? new product
// needs data, which will be sent from the front end.

// the data below will come from the front end

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  // this check below sees if the category even exists
  const category = await Category.findById(req.body.category); // not as specific as user because realistaclly you would just need an email for user instead of all information
  if (!category) return res.status(400).json({ message: "invalid category" });

  const file = req.file;
  if (!file)
    return res.status(400).json({ message: "no fileeee in the request" });

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`; // way to get host from the request
  let product = new Product({
    //new object being made here (refer to mongoose.model/productschema)
    name: req.body.name,
    desc: req.body.desc,
    richDesc: req.body.richDesc,
    image: `${basePath}${fileName}`, //multer creates a filename for you using date.now() and replaces oringinal " " with "-". this is what the fileName requests.
    // basepath = http://localhost:3000/public/upload and fileName is /image-4546 ( for example ) so as a whole it will be
    // http://localhost:3000/public/upload/image-4546
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  //model is ready, so you need to save it into database
  // 500 and 201 are status codes in HTTP
  product = await product.save();

  if (!product)
    return res.status(500).json({ message: "product can't be created" });

  res.send(product);
});

//updating category
router.put("/:productID", uploadOptions.single("image"), async (req, res) => {
  // this check below sees if the category even exists

  // since you can't catch an error with async you need to implement mongoose to counter it.
  // if you send a bad id you need to validate it but async doesn't have catches like promises. so it will hang somehow
  // look below on how to do

  if (!mongoose.isValidObjectId(req.params.productID)) {
    return res.status(400).send("Product ID don't exist");
  }

  const productcheck = await Product.findById(req.params.productID);
  if (!productcheck) return res.status(400).send("Product don't exist");

  const file = req.file; // request file
  let imagepath;

  if (file) {
    // if a new file was added... create a new link for the new uplload.
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
    imagepath = `${basePath}${fileName}`; // need to push basepath along with flename.
  } else {
    imagepath = product.image; // if no file was updated use the old image path..
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).json({ message: "invalid category" });

  const product = await Product.findByIdAndUpdate(
    //id has to match
    req.params.productID,
    //contains updated data
    {
      name: req.body.name,
      desc: req.body.desc,
      richDesc: req.body.richDesc,
      image: imagepath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true } // nodeJS basically returns original data to the user, but updates the databse. if you want new data returned you have to add this.
  );
  // if you get category you update it above, if not just do the following below.

  if (!product) return res.status(400).json({ message: "category not found" });

  return res.status(200).json({ message: "id found and updated", product });
});

router.delete("/:productID", async (req, res) => {
  // req.params.CategoryID, CategoryID has to be the same in below.
  // return has a promise, if category is found and if it isnt
  //Category.findByIdAndRemove(req.params.CategoryID)

  try {
    const product = await Product.findByIdAndDelete(req.params.productID);

    // params. An object containing parameter values parsed from the URL path. For example if you have the route /user/:name ,
    //then the "name" from the URL path wil be available as req.params.name .

    if (product) {
      return res
        .status(200)
        .json({ success: true, message: "Product is deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
  } catch {
    // what if there is an error in the server, in the connectionn or something like that
    return res
      .status(400)
      .json({ success: false, message: "Product failed, server error" });
  }
});
// this is for statistics purposes, getting count and what not
router.get(`/get/count`, async (req, res) => {
  // async and await require because productList will wait and be filled then go on to the next line
  const productCount = await Product.countDocuments(); // finds the exact amount of documents (product count) and saves it to productCount
  // waiting done then push out
  if (!productCount) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  res.send({
    amount_of_products: productCount,
  });
});

router.get(`/get/featuredProducts/:count`, async (req, res) => {
  // async and await require because productList will wait and be filled then go on to the next line

  const count = req.params.count ? req.params.count : 0; // basically if a user does upload a count, then count can be a count or 0 depending on if the user put in a count

  const products = await Product.find({ isFeatured: true }).limit(+count); // finds the products with a boolean true value for isFeatured and limits amount of results to count
  // {} because there is a condtion for the find above with a type
  if (!products) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  res.status(200).send(products);
});

// router.put(
//   "/:gallery-images/:productID",
//   uploadOptions.array("images", 10), // 10 represents a maxiumum of 10 pictures being added to a product
//   async (req, res) => {
//     if (!mongoose.isValidObjectId(req.params.productID)) {
//       return res.status(400).send("Product ID don't exist");
//     }
//     const files = req.files; // mutliple files (files is already in js, like the name thing)
//     const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
//     let imagePaths = [];
//     if (files) {
//       // if files exist, loop and make the imagespath array.
//       files.map((file) => {
//         imagePaths.push(`${basePath}${file.fileName}`); // need to push basepath and extension along with the filename.
//       });
//     }
//     const product = await Product.findByIdAndUpdate(
//       //id has to match
//       req.params.productID,
//       //contains updated data
//       {
//         images: imagePaths,
//       },
//       { new: true } // nodeJS basically returns original data to the user, but updates the databse. if you want new data returned you have to add this.
//     );
//     if (!product) {
//       return res.status(500).send("product cant be updated");
//     }
//     res.send(product);
//   }
// );

module.exports = router; // exporting the whole moduleukjkadsasdasd
