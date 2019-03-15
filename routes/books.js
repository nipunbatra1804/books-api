const express = require("express");
const router = express.Router();
const protectedRouter = express.Router();
const uuidv1 = require("uuid/v1");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const books = require("../tests/data/books.json");

const token = "Bearer my-awesome-token";
const verifyToken = (req, res, next) => {
  // check header for the token
  const recvdtoken = req.headers["authorization"];

  // decode token
  if (recvdtoken) {
    if (recvdtoken === token) {
      next();
    } else {
      res.status(401);
    }
  } else {
    // if there is no token
    res.status(403);
    res.send({
      message: "No token provided."
    });
  }
};

protectedRouter.use(verifyToken);

router.route("/").get((req, res) => {
  const query = req.query;
  if (Object.entries(query).length === 0) {
    res.json(books);
  } else {
    const keys = Object.keys(query);
    const filteredBooks = books.filter(
      book => keys.some(key => book[key] === query[key])//OR
      // keys.every(key => book[key] === query[key])//AND
    );
    res.status(200);
    res.json(filteredBooks);
  }
});

protectedRouter.route("/").post((req, res) => {
  const book = req.body;
  book.id = uuidv1();
  books.push(book);
  res.status(201);
  res.json(book);
});

protectedRouter
  .route("/:id")
  .put((req, res) => {
    const id = req.params.id;
    const book = req.body;
    let foundBook = books.find(elem => elem.id === id);
    if (!foundBook) {
      res.status(404);
      res.end();
    }
    foundBook = book;
    res.status(202);
    res.json(foundBook);
  })
  .delete((req, res) => {
    const id = req.params.id;
    let foundBook = books.find(elem => elem.id === id);
    if (!foundBook) {
      res.status(404);
      res.send();
    }
    let filteredBooks = books.filter(elem => elem.id !== id);
    Object.assign(books, filteredBooks);
    res.status(202);
    res.send();
  });
module.exports = { router, protectedRouter };

function jwtMw(req, res, next) {
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
}
