const request = require("supertest");
const app = require("../app");

describe("", () => {
  test("should return response 200 when at root", done => {
    request(app)
      .get("/")
      .expect(200, done);
  });
});
