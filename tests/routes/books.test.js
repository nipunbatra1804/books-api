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

  test("should get list of books of genre fantasy", done => {
    const path = "/books?genre=Fantasy";
    request(app)
      .get(path)
      .expect(res => hasCorrectAttributes(res, "genre", "Fantasy"))
      .end(done);
  });
});

const token = "Bearer my-awesome-token";

describe("/books post", () => {
  test("should add a  books", done => {
    const path = "/books";
    return request(app)
      .post(path)
      .set("Authorization", token)
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
      .set("Authorization", token)
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

  test("should NOT put", done => {
    const path = "/books/123";
    request(app)
      .put(path)
      .send({
        name: "LOTR",
        author: "JRRTolkein",
        genre: "Fantasy",
        price: "124",
        id: "123"
      })
      .expect(403, done);
  });
});

describe("/books delete", () => {
  test("should update a books", done => {
    const path = "/books/123";
    return request(app)
      .delete(path)
      .set("Authorization", token)
      .expect(202, done);
  });

  test("should not be able to delete a book", done => {
    const path = "/books/123";
    return request(app)
      .delete(path)
      .expect(403, done);
  });

  test("should not find a book", done => {
    const path = "/books/800";
    return request(app)
      .delete(path)
      .set("Authorization", token)
      .expect(404, done);
  });
});
