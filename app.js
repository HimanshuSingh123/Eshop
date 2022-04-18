const express = require("express"); //express used to host server (loibrary)
require("dotenv/config"); // read .env file
const morgan = require("morgan"); // morgan used to log our http requests from front end also a middleware
const mongoose = require("mongoose"); // helps implement mongodb application
const api = process.env.API_URL; // read .env file
//cors bascially makes it so that any frontend application
// can access this backend api
const cors = require("cors");
// ROUTER imported
const productsRouter = require("./routers/products");
const categoriesRouter = require("./routers/categories");
const usersRouter = require("./routers/users");
const ordersRouter = require("./routers/orders");

const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/errorhandler");
const app = express();

app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// Cross-origin resource sharing is a mechanism that allows restricted resources on a web page to be requested
//from another domain outside the domain from which the first resource was served. A web page may freely
//embed cross-origin images, stylesheets, scripts, iframes, and videos. BELOW
app.use(cors());
//options is some type of http request like get, post, delete etc.
// http options requests permitted communication for a given URL or server
// * means everything, i am allowing all other HTTP requests to be passed from
// any other origin
app.options("*", cors());

// for the post func to work, we need a middleware code that indicates
// we are dealing with JSON so vscode can understand that and
// take the data in. USE EXPRESS.
//middleware below

app.use(express.json());

// morgan used to log our http requests from front end
// also a middleware
// tiny means displaying log requestd  in a certain way
app.use(morgan("tiny"));
app.use(authJwt()); // any token request that comes will use authJwt(). It will return the that if a user can use the APIs or not. this a middleware
app.use(errorHandler);

// connects this file to the products file as thats where all the api's are.
// productsRouter represents a whole module containing the APIs that app has access through
// `${api}/products` just tells the APIs what the API link is
// ROUTERS
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);

// the model is called by the file in routersm not here.
// thats why are are no requires(./models/product) here

//conntection string to database in MongoDB
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "shop-database",
  })
  .then(() => {
    //.then prints out if no error
    console.log("database connection is ready");
  })
  .catch((err) => {
    //.catch prints out when error
    console.log(err);
  });
app.listen(3000, () => {
  console.log("server is running http://localhost:3000");
});
