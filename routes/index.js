const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
router.route("/").get((req, res) => {
    res.status(200);
    res.send("hello world");
});

async function authenticate(username, password) {
    //get user from users DB
    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error("User with username doesnt exist");
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new Error("You are not authorized");
        }
        return user;
    } catch (err) {
        throw Error(err);
    }
}

router
    .route("/token")
    .get(async (req, res) => {
        try {
            const { username, password } = req.body;

            const { _id } = await authenticate(username, password);

            if (_id) {
                const secret = process.env.SUPER_SECRET_KEY;

                const token = await jwt.sign({ _id }, secret);

                return res.status(200).json({
                    token
                });
            }
            return res.status(400).send("failed to authenticate");
        } catch (err) {
            res.status(400).json(err.message);
        }
    })
    .post(async (req, res) => {
        if (!req.headers.authorization) {
            res.sendStatus(401);
        }
        const secret = process.env.SUPER_SECRET_KEY;
        const token = req.headers.authorization.split("Bearer ")[0];
        const userData = await jwt.verify(token, secret);
        return res.status(200).json({ userData });
    });

router.route("/register").post(async (req, res) => {
    try {
        const user = new User(req.body);
        await User.init();
        await user.save();
        res.sendStatus(204);
    } catch (err) {
        res.status(400).json(err);
    }
});

router.route("/login").post(async (req, res) => {
    try {
        const { username, password } = req.body;
        await authenticate(username, password);
        return res.status(200).send("You  logged in");
    } catch (err) {
        res.status(400).json(err.message);
    }
});

module.exports = router;
