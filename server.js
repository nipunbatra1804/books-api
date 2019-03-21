const app = require("./app");
const mongoose = require("mongoose");
const inDevEnv = process.env.NODE_ENV === "dev";

mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);

if (inDevEnv) {
    require("dotenv").config();
}

const mongodbUri = process.env.MONGODB_URI;
const port = process.env.PORT;
console.log(mongodbUri);
mongoose.connect(mongodbUri);
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
