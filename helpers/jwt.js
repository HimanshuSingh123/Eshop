const expressJwt = require("express-jwt"); // this is helper file. this is a middleware file. it protects APi's from
// being used by unauthorized users. Used to secure API's in our server

function authJwt() {
  const secret = process.env.secret;
  const prefixAPI = process.env.API_URL;
  // the function below has options, we've talked before our secret. so when someone passes a token to our backend
  // we need to compare it with the secret (token's password) so if the token is generated based on that secret
  // then he will have access to the API
  // BUT if his token is based on some next secret then the API's will not work.
  return expressJwt({
    secret, //;ibrary basiclaly breaks a token down and see's if it's from this eshop or not
    //The secret key is combined with the header and the payload to create a unique hash. You are only able to verify this hash if you have the secret key.
    // we need to pass the algorithm generating this token too
    algorithms: ["HS256"],
    isRevoked: isRevoked, //contains isAdmin
    // isrevoked, a function, revokes a token based on some certain conditions. in isrevoke's callback we can specify if user is admin or not.
  }).unless({
    // these are all the API's you want to exclude. for exmaple, if you sign in and the login API is not excluded a person can't sign in
    path: [
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] }, // this line here specifies what link is excluded with specific methods. you don't want people to post products.
      // url: /\/api\/v1\/products(.*)/ is a regular expression and it means that any ending for product is allowed to be accessed without auth.
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      //{ url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
      "/api/v1/users/login",
      "/api/v1/users/register",
    ],
  });
}

module.exports = authJwt;

async function isRevoked(req, payload, done) {
  // req is when you need to use req body
  //payload contains data in the token (e,g isAdmin)
  if (!payload.isAdmin) {
    done(null, true); // this says reject the token
  }
  done();
}
