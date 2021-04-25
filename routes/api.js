"use strict";

const Translator = require("../components/translator.js");

module.exports = function (app) {
  const translator = new Translator();
  const allowedLocales = ["american-to-british", "british-to-american"];

  app.route("/api/translate").post((req, res) => {
    const text = req.body.text;
    const locale = req.body.locale;

    if (text === undefined || !locale) {
      res.json({ error: "Required field(s) missing" });
    } else if (text.length === 0) {
      res.json({ error: "No text to translate" });
    } else if (!allowedLocales.find((el) => el === locale)) {
      res.json({ error: "Invalid value for locale field" });
    } else {
      const translation = translator.translate(req.body.text, locale);
      res.json({ translation, text });
    }
  });
};
