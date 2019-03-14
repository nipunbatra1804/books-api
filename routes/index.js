const express = require("express");
const router = express.Router();

router.route("/").get((req, res) => {
  res.status(200);
  res.send();
});

module.exports = router;
