const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: true
    }
});
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    try {
        const hash = await bcrypt.hash(this.password, 12);
        this.password = hash;
    } catch (err) {
        next(err);
    }
    return next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
