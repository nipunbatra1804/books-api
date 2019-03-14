const express = require("express");
const index = require("./routes/index");
const books = require("./routes/books");
const config = require("./config/config");

const app = express();

app.set("Secret", config.secret);

app.use(express.static("public"));
app.use(express.json());
app.use("/books", books.router);
app.use("/books", books.protectedRouter);
app.use("/", index);

module.exports = app;
