require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const books = require("../data/books.json");
const config = require("../../config/config");
const Book = require("../../models/book");

// eslint-disable-next-lines no-undef
const { MongoMemoryServer } = require("mongodb-memory-server");
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
function hasCorrectAttributes(res, property, val) {
    const { body } = res;
    if (body.every(elem => elem[property] === val)) {
        return;
    }
    throw new Error("faulty");
}

jest.mock("jsonwebtoken");
const jwt = require("jsonwebtoken");

jest.mock("../../models/user");
const User = require("../../models/user");

describe("/books get", () => {
    let mongoServer;
    let db;
    beforeAll(async () => {
        // connect to db
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getConnectionString();
        await mongoose.connect(mongoUri, err => {
            if (err) console.error(err);
        });
    });

    afterAll(async () => {
        mongoose.disconnect();
        await mongoServer.stop();
    });

    describe("get books", () => {
        beforeEach(async () => {
            await Book.insertMany(books);
            db = mongoose.connection;
        });
        afterEach(async () => {
            const status = await db.dropCollection("books");
        });
        test("should get list of books", done => {
            const path = "/books";
            request(app)
                .get(path)
                .expect(200)
                .then(res => {
                    res.body.forEach((book, index) => {
                        // eslint-disable-next-line no-undef
                        expect(book).toEqual(
                            expect.objectContaining({
                                name: books[index].name,
                                author: books[index].author,
                                genre: books[index].genre,
                                _id: expect.any(String)
                            })
                        );
                    });
                    done();
                });
        });
        test("should get list of books 2", done => {
            const path = "/books";
            request(app)
                .get(path)
                .expect(res => {
                    res.body.forEach((book, index, books) => {
                        expect(book).toEqual(
                            expect.objectContaining({
                                name: books[index].name,
                                author: expect.any(String),
                                genre: expect.any(String),
                                _id: expect.any(String)
                            })
                        );
                    });
                })
                .expect(200, done);
        });

        test("should get list of books of genre fantasy", done => {
            const path = "/books?genre=Fantasy";
            request(app)
                .get(path)
                .expect(res => hasCorrectAttributes(res, "genre", "Fantasy"))
                .end(done);
        });

        test("should get list of books of genre fantasy and author rowling", done => {
            const path = "/books?genre=Fantasy&author=rowling";
            request(app)
                .get(path)
                .expect(res => hasCorrectAttributes(res, "genre", "Fantasy"))
                .expect(res => hasCorrectAttributes(res, "author", "rowling"))
                .end(done);
        });
    });
});

const token = "Bearer my-awesome-token";

describe("/books post", () => {
    let mongoServer;
    let db, token;
    const dummyUser = {
        username: "aabb",
        password: "pskpsk"
    };

    beforeAll(async () => {
        // connect to db
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getConnectionString();
        await mongoose.connect(mongoUri, err => {
            if (err) console.error(err);
        });
    });

    afterAll(async () => {
        mongoose.disconnect();
        await mongoServer.stop();
    });
    afterEach(async () => {
        jwt.verify.mockReset();
    });

    test("should add a books", async done => {
        const path = "/books";
        jwt.verify.mockResolvedValue({});
        const res = await request(app)
            .post(path)
            .set("access-token", "rubbish")
            .send({
                name: "LOTR",
                author: "JRRTolkein",
                genre: "Fantasy",
                price: 124
            })
            .expect(201);

        expect(res.body).toEqual(
            expect.objectContaining({
                name: "LOTR",
                author: "JRRTolkein",
                genre: "Fantasy",
                price: 124
            })
        );
        const book = await Book.findOne({ name: "LOTR" });
        expect(book).toEqual(
            expect.objectContaining({
                name: "LOTR",
                author: "JRRTolkein"
            })
        );
        done();
    });
});

describe("/books put", () => {
    let mongoServer, token;

    const dummyUser = {
        username: "aabb",
        password: "pskpsk"
    };
    beforeAll(async () => {
        // connect to db
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getConnectionString();
        await mongoose.connect(mongoUri, err => {
            if (err) console.error(err);
        });
    });

    afterAll(async () => {
        mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Book.insertMany(books);
        db = mongoose.connection;
    });

    afterEach(async () => {
        jwt.verify.mockReset();
    });

    test("should update a books", async done => {
        const { _id } = await Book.findOne({ name: "harry" });
        jwt.verify.mockResolvedValue({});
        const path = `/books/${_id}`;
        await request(app)
            .put(path)
            .set("access-token", "")
            .send({
                name: "harry",
                author: "JK rowling",
                genre: "Fantasy",
                price: "124",
                quantity: "21"
            })
            .expect(202);

        const book = await Book.findOne({ name: "harry" });
        expect(book).toEqual(
            expect.objectContaining({
                name: "harry",
                author: "JK rowling"
            })
        );
        done();
    });

    test("should NOT put", async done => {
        const { _id } = await Book.findOne({ name: "harry" });
        jwt.verify.mockRejectedValue({});
        const path = `/books/${_id}`;
        request(app)
            .put(path)
            .send({
                name: "harry",
                author: "JK rowling",
                genre: "Fantasy",
                price: 124,
                _id: expect.any(String)
            })
            .expect(403, done);
    });
});

describe.skip("/books delete", () => {
    let mongoServer;
    beforeAll(async () => {
        // connect to db
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getConnectionString();
        await mongoose.connect(mongoUri, err => {
            if (err) console.error(err);
        });
    });

    afterAll(async () => {
        mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Book.insertMany(books);
        db = mongoose.connection;
    });

    test("should delete a books", async () => {
        let { _id } = await Book.findOne({ name: "harry" });
        console.log(_id);
        const path = `/books/${_id}`;

        await request(app)
            .delete(path)
            .set("Authorization", token)
            .expect(202);

        _id = await Book.findOne({ _id: _id });
        expect(_id).toBe(null);
    });

    test("should not be able to delete a book", async done => {
        const { _id } = await Book.findOne({ name: "harry" });
        const path = `/books/${_id}`;
        request(app)
            .delete(path)
            .expect(403, done);
    });

    // eslint-disable-next-line no-undef
    test("should not find a book", done => {
        const path = "/books/5c909e8e45ca5487db3e30ea";
        return request(app)
            .delete(path)
            .set("Authorization", token)
            .expect(404, done);
    });
});
