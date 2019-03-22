const express = require("express");
const router = express.Router();
const protectedRouter = express.Router();
const uuidv1 = require("uuid/v1");
const config = require("../config/config");
const jwt = require("jsonwebtoken");

const books = require("../tests/data/books.json");
const Book = require("../models/book");
const User = require("../models/user");

const token = "Bearer my-awesome-token";

const verifyToken = async (req, res, next) => {
    // verifies secret and checks if the token is expired
    try {
        console.log(process.env.SUPER_SECRET_KEY);
        const verify = await jwt.verify(
            req.headers["access-token"],
            process.env.SUPER_SECRET_KEY
        );
        if (verify) {
            console.log(verify);

            return next();
        }
        throw new Error("unable to verify");
    } catch (err) {
        return res.status(403).send(err.message);
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

        return Book.replaceOne(
            { _id },
            req.body,
            { new: true, runValidators: true },
            (err, book) => {
                if (!err) return res.status(202).json(book);
                return res.sendStatus(400);
            }
        );

        return Book.findOneAndUpdate(
            { _id },
            req.body,
            { new: true, runValidators: true },
            (err, book) => {
                if (!err) return res.status(202).json(book);
                return res.sendStatus(400);
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
