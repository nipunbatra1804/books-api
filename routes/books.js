const express = require("express");
const router = express.Router();
const protectedRouter = express.Router();
const uuidv1 = require("uuid/v1");
const config = require("../config/config");
const jwt = require("jsonwebtoken");

const books = require("../tests/data/books.json");
const Book = require("../models/book");

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
    const { query } = req;

    if (Object.entries(query).length === 0) {
        Book.find()
            .then(response => res.json(response))
            .catch(err => res.status(401).end());
    } else {
        Book.find(query)
            .then(response => res.json(response))
            .catch(err => res.status(401).end());
    }
});

protectedRouter.route("/").post((req, res) => {
    const book = new Book(req.body);
    book.save((err, book) => {
        if (err) {
            res.status(500).end();
            return;
        }
        res.status(201).json(book);
    });
});

protectedRouter
    .route("/:_id")
    .put((req, res) => {
        const { _id } = req.params;
        const book = req.body;

        return Book.findByIdAndUpdate(
            _id,
            req.body,
            { new: true, runValidators: true },
            (err, book) => {
                if (!err) return res.status(202).json(book);
            }
        );
    })
    .delete((req, res) => {
        const { _id } = req.params;
        return Book.findByIdAndDelete(_id, (err, book) => {
            if (!err) {
                if (!book) {
                    return res.sendStatus(404);
                }
                return res.status(202).json(book);
            }

            return res.status(404).send();
        });
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
