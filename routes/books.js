const express = require("express");
const router = express.Router();
const protectedRouter = express.Router();
const uuidv1 = require("uuid/v1");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const books = require("../tests/data/books.json");

router.route("/").get((req, res) => {
  const query = req.query;
  if (Object.entries(query).length === 0) {
    res.json(books);
  } else {
    const keys = Object.keys(query);
    const filteredBooks = books.filter(book =>
      keys.every(key => book[key] === query[key])
    );
    res.status(200);
    res.json(filteredBooks);
  }
});
const payload = {
  check: true
};

const token = jwt.sign(payload, config.secret, {
  expiresIn: 1440 // expires in 24 hours
});
const verifyToken = (req, res, next) => {
  // check header for the token
  var recvdtoken = req.headers["access-token"];

  // decode token
  if (recvdtoken) {
    // verifies secret and checks if the token is expired
    jwt.verify(recvdtoken, config.secret, (err, decoded) => {
      if (err) {
        return res.json({ message: "invalid token" });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token

    res.send({
      message: "No token provided."
    });
  }
};

protectedRouter.use(verifyToken);

protectedRouter.route("/").post((req, res) => {
  const book = req.body;
  book.id = uuidv1();
  books.push(book);
  res.status(201);
  res.json(book);
});

protectedRouter.route("/:id").put((req, res) => {
  const id = req.params.id;
  const book = req.body;
  let foundBook = books.find(elem => elem.id === id);
  foundBook = book;
  res.status(202);
  res.json(foundBook);
});

module.exports = { router, protectedRouter };

/*
(req, res, next) => {
    // check header for the token
    var token = req.headers["access-token"];
  
    // decode token
    if (token) {
      // verifies secret and checks if the token is expired
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.json({ message: "invalid token" });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      // if there is no token
  
      res.send({
        message: "No token provided."
      });
    }
  });
  */
