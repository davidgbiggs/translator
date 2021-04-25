const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server.js");

chai.use(chaiHttp);

let Translator = require("../components/translator.js");

suite("Functional Tests", () => {
  test("Translation with text and locale fields: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post("/api/translate")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        text: "We watched the footie match for a while.",
        locale: "british-to-american",
      })
      .end(function (error, res) {
        assert.deepEqual(res.body, {
          translation:
            'We watched the <span class="highlight">soccer</span> match for a while.',
          text: "We watched the footie match for a while.",
        });
        done();
      });
  });
  test("Translation with text and invalid locale field: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post("/api/translate")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        text: "We watched the footie match for a while.",
        locale: "bitish-to-american",
      })
      .end(function (error, res) {
        assert.deepEqual(res.body, { error: "Invalid value for locale field" });
        done();
      });
  });
  test("Translation with missing text field: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post("/api/translate")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({ locale: "british-to-american" })
      .end(function (error, res) {
        assert.deepEqual(res.body, { error: "Required field(s) missing" });
        done();
      });
  });
  test("Translation with missing locale field: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post("/api/translate")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({ text: "We watched the footie match for a while." })
      .end(function (error, res) {
        assert.deepEqual(res.body, { error: "Required field(s) missing" });
        done();
      });
  });
  test("Translation with empty text: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post("/api/translate")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({ text: "", locale: "british-to-american" })
      .end(function (error, res) {
        assert.deepEqual(res.body, { error: "No text to translate" });
        done();
      });
  });
  test("Translation with text that needs no translation: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post("/api/translate")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        text: "We watched the soccer match for a while.",
        locale: "british-to-american",
      })
      .end(function (error, res) {
        assert.deepEqual(res.body, {
          translation: "Everything looks good to me!",
          text: "We watched the soccer match for a while.",
        });
        done();
      });
  });
});
