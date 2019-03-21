require("dotenv").config();

const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../../app");
const books = require("../data/books.json");
const User = require("../../models/user");
const Book = require("../../models/book");
const { MongoMemoryServer } = require("mongodb-memory-server");
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);

describe("/register check if user can register as a new user", () => {
    let mongoServer;
    let db;
    beforeEach(async () => {
        // connect to db
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getConnectionString();
        await mongoose.connect(mongoUri, err => {
            if (err) console.error(err);
        });
    });

    afterEach(async () => {
        mongoose.disconnect();
        await mongoServer.stop();
    });

    test("should create user ", async done => {
        await request(app)
            .post("/register")
            .send({
                username: "aabb",
                password: "pskpsk"
            })
            .expect(204);
        const { username } = await User.findOne({ username: "aabb" });
        expect(username).toEqual("aabb");
        done();
    });
    test("should be able to login and should not be able to login", async done => {
        const dummyUser = {
            username: "aabb",
            password: "pskpsk"
        };
        const dummyHacker = {
            username: "aabb",
            password: "kpsk"
        };
        await request(app)
            .post("/register")
            .send(dummyUser)
            .expect(204);

        await request(app)
            .post("/login")
            .send(dummyUser)
            .expect(200);

        await request(app)
            .post("/login")
            .send(dummyHacker)
            .catch(err => expect(err.status).toEqual(400));

        done();
    });
});

describe("Retrieve Token", () => {
    const dummyUser = {
        username: "aabb",
        password: "pskpsk"
    };
    beforeEach(async () => {
        // connect to db
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getConnectionString();
        await mongoose.connect(mongoUri, err => {
            if (err) console.error(err);
        });
        await request(app)
            .post("/register")
            .send(dummyUser);
    });

    afterEach(async () => {
        mongoose.disconnect();
        await mongoServer.stop();
    });

    test("should retrieve token", async done => {
        try {
            const { token } = await request(app)
                .get("/token")
                .send(dummyUser)
                .expect(200)
                .then(res => res.body);

            expect(token).toEqual(expect.any(String));
        } catch (err) {
            console.log(err);
        }
        done();
    });
});
