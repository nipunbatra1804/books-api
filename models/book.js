const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        author: { type: String, required: true },
        genre: { type: String, required: false },
        price: { type: Number, required: true },
        quantity: { type: Number, required: false }
    },
    { timestamps: { createdAt: "created_at" } }
);
bookSchema.virtual("titleAuthor").get(function() {
    return `${this.name} ${this.author}`;
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
