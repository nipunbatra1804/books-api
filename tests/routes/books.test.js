const request = require("supertest");
const app = require("../../app");
const books = require("../data/books.json");
const config = require("../../config/config");
const jwt = require("jsonwebtoken");

function hasCorrectAttributes(res, property, val) {
  const body = res.body;
  if (body.every(elem => elem[property] === val)) {
    return;
  }
  throw new Error("faulty");
}
describe("/books get", () => {
  test("should get list of books", done => {
    const path = "/books";
    request(app)
      .get(path)
      .expect(200)
      .expect(books)
      .then(res => {
        expect(res.body).toEqual(expect.any(Array));
        done();
      });
  });

  test("should get list of books of genre fantasy", async () => {
    const path = "/books?genre=Fantasy";
    await request(app)
      .get(path)
      .expect(200)
      .expect(res => hasCorrectAttributes(res, "genre", "Fantasy"));
  });
});

const payload = {
  check: true
};

const token = jwt.sign(payload, config.secret, {
  expiresIn: 1440 // expires in 24 hours
});

describe("/books post", () => {
  test("should add a  books", done => {
    const path = "/books";
    return request(app)
      .post(path)
      .set("access-token", token)
      .send({
        name: "LOTR",
        author: "JRRTolkein",
        genre: "Fantasy",
        price: "100"
      })
      .expect(201)
      .then(res => {
        expect(res.body).toEqual({
          name: "LOTR",
          author: "JRRTolkein",
          genre: "Fantasy",
          price: "100",
          id: expect.any(String)
        });
        done();
      });
  });
});

describe("/books put", () => {
  test("should update a books", done => {
    const path = "/books/123";
    return request(app)
      .put(path)
      .set("access-token", token)
      .send({
        name: "LOTR",
        author: "JRRTolkein",
        genre: "Fantasy",
        price: "124",
        id: "123"
      })
      .expect(202)
      .then(res => {
        expect(res.body).toEqual({
          name: "LOTR",
          author: "JRRTolkein",
          genre: "Fantasy",
          price: "124",
          id: expect.any(String)
        });
        done();
      });
  });
});
