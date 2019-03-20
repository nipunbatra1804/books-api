const express = require("express");
const router = express.Router();

router.route("/").get((req, res) => {
    res.status(200);
    res.send("hello world");
});

module.exports = router;
