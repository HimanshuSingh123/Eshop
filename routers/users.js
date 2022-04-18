// c5 begin

// double . below (..) gives access to all children no matter how deep
const { User } = require("../models/user"); // connects to product file in module so APIs can use that "interface"
const express = require("express"); //express used to host server (loibrary)
const router = express.Router(); // resposible for storing APIs, creating them, and transproting them between files
// router can also be used with middleware

const jwt = require("jsonwebtoken"); // server respons with jsonwebtoken after user signs in successfully to authise use of api's, so you need this.

const bcrypt = require("bcryptjs"); // password protection library to apply on to passwords

router.get(`/`, async (req, res) => {
  // async and await require because productList will wait and be filled then go on to the next line
  // waiting done then push out below

  const userList = await User.find().select("-passHash"); //select removes any certain parameter from showing up, in this case, passhash. or you can specify which ones
  // you just want without the -
  if (!userList) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get(`/:userID`, async (req, res) => {
  // async and await require because productList will wait and be filled then go on to the next line
  const user = await User.findById(req.params.userID).select("-passHash"); // finds the exact model in the database with those parameters (I think)
  // waiting done then push out
  if (!user) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  res.send(user);
});

// registering user
router.post("/register", async (req, res) => {
  // let because it's a variable
  let user = new User({
    //new object being made here (refer to mongoose.model/productschema)
    name: req.body.name,
    email: req.body.email,
    passHash: bcrypt.hashSync(req.body.password, 10), // asks for string and salt (1st and second paramater.) salt is extra secret info so any person cant descyrpt hash.
    //  the password in req.body.password will be the same info title in JSON file
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
  });
  // don't need to .then() and .catch() with await
  user = await user.save();

  if (!user)
    // if the above statement fails..
    return res.status(404).sendStatus("User cannot be created");

  res.send(user);
});
// user sign in
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email }); // finds one document with parameters email.
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send("user not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passHash)) {
    const token = jwt.sign(
      {
        // when user authenticated, this jwt token comes into play and you can pass information in it along with secret.
        userId: user.id,
        isAdmin: user.isAdmin, //this is here because if it's in the database someone can manipulate json file to fake admin, but here you need the right token. This is a secret.
        // tells token whether or not if the user is an admin on the shop or not, if he can log into the admin panel or not.
        // sends with token.,
      },
      secret, // secret is something like for example password which is used to create your tokens
      { expiresIn: "1d" }
    );

    res.status(200).send({ user: user.email, token: token }); // we send the email of the user and his respective token to use it in the front end to access API
  } else {
    res.status(400).send("wrong password");
  } // compares the user password entered to the passhash

  //return res.status(200).send(user); // user found, so return user.
});

router.get(`/get/count`, async (req, res) => {
  // async and await require because productList will wait and be filled then go on to the next line
  const userCount = await User.countDocuments(); // finds the exact amount of documents (product count) and saves it to productCount
  // waiting done then push out
  if (!userCount) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  res.send({
    amount_of_users: userCount,
  });
});

router.delete("/:userID", async (req, res) => {
  // req.params.CategoryID, CategoryID has to be the same in below.
  // return has a promise, if category is found and if it isnt
  //Category.findByIdAndRemove(req.params.CategoryID)

  try {
    const user = await User.findByIdAndDelete(req.params.userID);

    // params. An object containing parameter values parsed from the URL path. For example if you have the route /user/:name ,
    //then the "name" from the URL path wil be available as req.params.name .

    if (user) {
      return res
        .status(200)
        .json({ success: true, message: "User is deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch {
    // what if there is an error in the server, in the connectionn or something like that
    return res
      .status(400)
      .json({ success: false, message: "User failed, server error" });
  }
});

module.exports = router;
