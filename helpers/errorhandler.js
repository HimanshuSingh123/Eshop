function errorHandler(err, req, res, next) {
  // this handles all the errors coming in from the fron end
  if (err.name === "UnauthorizedError") {
    // if the error is a unauthorized error
    return res.status(500).json({ message: "user is not authorized" });
  }

  if (err.name === "ValidationError") {
    // e.g you get a pdf but were expecting a jpg
    // if the error is a validation error
    return res.status(500).json({ message: err });
  }

  return res.status(500).json(err); //default error 500 (server)
}

module.exports = errorHandler;
