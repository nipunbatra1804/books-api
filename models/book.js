const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    name: String,
    author: String,
    genre: String,
    price: Number,
    quantity: Number
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
