// double . below (..) gives access to all children no matter how deep
const { Order } = require("../models/order"); // connects to product file in module so APIs can use that "interface"
const express = require("express"); //express used to host server (loibrary)
const router = express.Router(); // resposible for storing APIs, creating them, and transproting them between files
// router can also be used with middleware
const { OrderItem } = require("../models/orderitem");

// POPULATING TREE
router.get(`/:orderID`, async (req, res) => {
  // async and await require because productList will wait and be filled then go on to the next line
  const order = await Order.findById(req.params.orderID)
    .populate("user", "name") // populates user info by name
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    }); // when you want to populate an attribute inside another one (populating product and category)
  // waiting done then push out
  if (!order) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    // used because of array, to promise all values
    // NO AWAIT HERE (NO PROMISE RESOLVE)
    // we need to resolve two promises waiting on
    // the async function as they were invoked by them. therefore, you need to
    // promise by combining both promises together (since user is sending array
    // of items)
    req.body.orderItems.map(async (orderitem) => {
      //array of IDs refer to orderitems
      let newOrderItem = new OrderItem({
        quantity: orderitem.quantity,
        product: orderitem.product,
      }); // for every order item, we are making a new order item based on the
      // orderItem array of the user.

      newOrderItem = await newOrderItem.save(); // saving these new order items
      // in the database.

      return newOrderItem._id; // so we only get the id's in the array
    })
  );
  //console.log(orderItemIds) prom all and below
  const orderItemsIdsResolved = await orderItemsIds; //await is a way of dealing
  // with promises, so you need to deal with it and combine it with the array
  // one

  let totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      // map over the resolved Id's
      const orderItem = await OrderItem.findById(orderItemId).populate(
        // find orderitem in the map, and populate it by produce and pirce
        "product",
        "price" //product is property,
      );
      const totalPrice = orderItem.product.price * orderItem.quantity; // multiply the prices by the quantity and assign tot total
      return totalPrice; // return total.
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0); // takes the array, reduces it to sum of all numbers inside the array. the 0 is the initial sum.

  console.log(totalPrices);

  // let because it's a variable
  let order = new Order({
    //new object being made here (refer to mongoose.model/productschema)
    orderItems: orderItemsIdsResolved, // we need orderItemsIds not requesting from user.
    // need to create order items first in the database and then attach them to
    // the order requests which we have here. Order items are arrays of id's from
    // order item table. we need to create those id's (using mongoose)\
    // then relate them to this order. we do this because the admin will
    // have difficulty finding the orders aftr user placed.
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice, // need to calculate this internally for security reasons. hacker could access json file if it was front end and make 1000 dollar order 2 dollars
    user: req.body.user,
  });
  // don't need to .then() and .catch() with await
  order = await order.save();

  if (!order)
    // if the above statement fails..
    return res.status(404).sendStatus("order cannot be created");

  res.send(order);
});

router.put("/:orderID", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    //id has to match
    req.params.orderID,
    //contains updated data
    {
      status: req.body.status,
    },
    { new: true } // nodeJS basically returns original data to the user, but updates the databse. if you want new data returned you have to add this.
  );
  // if you get order you update it above, if not just do the following below.

  if (!order) return res.status(400).json({ message: "order not found" });

  return res.status(200).json({ message: "id found and updated", order });
});

router.delete("/:orderID", async (req, res) => {
  // req.params.CategoryID, CategoryID has to be the same in below.
  // return has a promise, if category is found and if it isnt
  //Category.findByIdAndRemove(req.params.CategoryID)

  // Deleting Order is not enough, we still have the related order items in the database.
  Order.findByIdAndRemove(req.params.orderID)
    .then(async (order) => {
      // so after finding the order through orderID, you need to
      // loop through orderItems to delete all orderitems.
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          //mapping every orderID to loop through it, and waiting for it to be done.
          await OrderItem.findByIdAndRemove(orderItem); // finding that orderItem and waiting for deleting it
        });
      }
      if (order) {
        return res
          .status(200)
          .json({ success: true, message: "order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found" });
      }
      // params. An object containing parameter values parsed from the URL path. For example if you have the route /user/:name ,
      //then the "name" from the URL path wil be available as req.params.name .
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    // aggreegate groups together mutliple attributes and returns them as an object. "$sum" is a reserved word in mongoose.
    { $group: { _id: "$user", totalsales: { $sum: "$totalPrice" } } }, //mongoose can't send any object without an ID.
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated.");
  }

  res.send({ totalsales: totalSales });
});

// this is for statistics purposes, getting count and what not
router.get(`/get/count`, async (req, res) => {
  // async and await require because productList will wait and be filled then go on to the next line
  const orderCount = await Order.countDocuments(); // finds the exact amount of documents (product count) and saves it to productCount
  // waiting done then push out
  if (!orderCount) {
    // if not found return false
    res.status(500).json({ success: false });
  }
  res.send({
    amount_of_orders: orderCount,
  });
});

router.get(`/get/user-orders/:userID`, async (req, res) => {
  // this API gets order information for a specific user.
  const userOrderList = await Order.find({ user: req.params.userID })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
