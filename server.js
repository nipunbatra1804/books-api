const app = require("./app");
const mongoose = require("mongoose");
const port = process.env.PORT || 8080;

inDevEnv = process.env.NODE_ENV === "dev";

//connect to db
mongoose.connect("mongodb://localhost:27017/books-db");
const db = mongoose.connection;

db.on("error", () => {
    console.error("unable to connect to the database");
});

db.once("connected", async () => {
    console.log("Successfully connected to the database");
    app.listen(port, () => {
        if (inDevEnv) {
            console.log(`server is running on http://localhost:${port}`);
        } else {
            console.log(`server is running on heroku:${port}`);
        }
    });
});
