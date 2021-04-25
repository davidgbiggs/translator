const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

class Translator {
  /* This is data processing that is necessary for readability/consistency and is a result of the free code camp "given" data.
   ** I assume FCC wants me to complete the project with the given data, and not make new data. So I'm processing it on object
   ** construction to keep the extra work to a minimum. In a production system, I'd keep it in a separate file since the space
   ** impact would be negligible. */
  constructor() {
    this.americanToBritishSpelling = new Map(
      Object.entries(americanToBritishSpelling)
    );
    this.britishToAmericanSpelling = new Map(
      Object.entries(Translator.objectFlip(americanToBritishSpelling))
    );
    this.americanToBritishTitles = new Map(
      Object.entries(americanToBritishTitles)
    );
    this.britishToAmericanTitles = new Map(
      Object.entries(Translator.objectFlip(americanToBritishTitles))
    );
    this.americanOnly = new Map(Object.entries(americanOnly));
    this.americanOnlyFirsts = new Map();
    Object.entries(americanOnly).forEach((entry) => {
      this.americanOnlyFirsts.set(entry[0].split(" ")[0], null);
    });
    this.britishOnly = new Map(Object.entries(britishOnly));
    this.britishOnlyFirsts = new Map();
    Object.entries(britishOnly).forEach((entry) => {
      this.britishOnlyFirsts.set(entry[0].split(" ")[0], null);
    });
  }

  /* Optimal solution. Achieved in one pass through the array in the best case; depending on multi-word replacements
   ** there could be many passes, however, I think it is likely very few, especially compared to the naïve solution below. */
  translate(phrase, locale) {
    // helper functions
    function replaceHelper(string, pre, post) {
      hasReplaced = true;
      return `${pre ?? ""}<span class="highlight">${string}</span>${
        post ?? ""
      }`;
    }
    // Parses ending & beginning punctuation and word. Returns array
    function parsePunctuation(word) {
      const punctuationRegex = /([^\w\d:]*)(\w*)([^\w\d:]*)/;
      try {
        const [_, pre, plainWord, post] = word.match(punctuationRegex);
        return [pre, plainWord, post];
      } catch (error) {
        return ["", undefined, ""];
      }
    }

    let hasReplaced = false;
    const toBritish = locale === "american-to-british";

    const spellingMap = toBritish
      ? this.americanToBritishSpelling
      : this.britishToAmericanSpelling;
    const onlyMap = toBritish ? this.americanOnly : this.britishOnly;
    const onlyFirsts = toBritish
      ? this.americanOnlyFirsts
      : this.britishOnlyFirsts;
    const titleMap = toBritish
      ? this.americanToBritishTitles
      : this.britishToAmericanTitles;

    const phraseArr = phrase.split(" ");
    const timeRegex = new RegExp(
      `(\\d*\\d)${toBritish ? ":" : "."}(\\d\\d)`,
      "g"
    );

    for (let i = 0; i < phraseArr.length; i += 1) {
      let currentWord = phraseArr[i].toLowerCase();
      const [firstPre, unused1, firstPost] = parsePunctuation(phraseArr[i]);

      if (currentWord[currentWord.length - 1].match(/[.!?\\-]/)) {
        currentWord = currentWord.slice(0, currentWord.length - 1);
      }

      if (spellingMap.has(currentWord)) {
        const translation = spellingMap.get(currentWord);
        phraseArr[i] = replaceHelper(translation);
      } else if (titleMap.has(phraseArr[i])) {
        const translation = titleMap.get(phraseArr[i]);
        phraseArr[i] = replaceHelper(translation);
      } else if (currentWord.match(timeRegex)) {
        phraseArr[i] = currentWord.replace(timeRegex, (match, p1, p2) => {
          return (
            replaceHelper(`${p1}${toBritish ? "." : ":"}${p2}`) + firstPost
          );
        });
      } else if (onlyFirsts.has(currentWord)) {
        let currentMatch;
        const [unused2, secondWord, secondPost] = parsePunctuation(
          phraseArr[i + 1]
        );
        const [unused3, thirdWord, thirdPost] = parsePunctuation(
          phraseArr[i + 2]
        );

        let twoWords;
        let threeWords;

        if (secondWord) {
          twoWords = `${currentWord} ${secondWord.toLowerCase()}`;
        }
        if (thirdWord) {
          threeWords = `${currentWord} ${secondWord.toLowerCase()} ${thirdWord.toLowerCase()}`;
        }

        let endingPunctuation;
        if (onlyMap.has(threeWords)) {
          currentMatch = threeWords;
          endingPunctuation = thirdPost;
        } else if (onlyMap.has(twoWords)) {
          currentMatch = twoWords;
          endingPunctuation = secondPost;
        } else if (onlyMap.has(currentWord)) {
          currentMatch = currentWord;
          endingPunctuation = firstPost;
        } else {
          continue;
        }

        let translationArr = onlyMap.get(currentMatch).split(" ");
        translationArr[0] = `${firstPre}<span class="highlight">${translationArr[0]}`;
        translationArr[translationArr.length - 1] = `${
          translationArr[translationArr.length - 1]
        }</span>${endingPunctuation}`;

        phraseArr.splice(i, currentMatch.split(" ").length, ...translationArr);
        hasReplaced = true;
      }
    }

    return hasReplaced ? phraseArr.join(" ") : "Everything looks good to me!";
  }

  /* naïve solution: reassign string on every iteration using regex replace. */
  // translate(phrase, locale) {
  //   let hasReplaced = false;
  //   const toBritish = locale === 'american-to-british';

  //   const translationObject = toBritish ? {...americanOnly, ...americanToBritishSpelling, ...americanToBritishTitles} : {...britishOnly, ...Translator.objectFlip(americanToBritishSpelling), ...Translator.objectFlip(americanToBritishTitles, true)};

  //   let newPhrase = phrase;

  //   for (let entry of Object.entries(translationObject)) {
  //     const regex = new RegExp(`([\\s]*)(${entry[0]})([?.\\s]+)`, "gi");
  //     newPhrase = newPhrase.replace(regex, (match, p1, _, p3) => replaceHelper(entry[1], p1, p3));
  //   }

  //   const timeRegex = new RegExp(`(\\d*\\d)${toBritish ? ":" : "."}(\\d\\d)`, 'g');
  //   newPhrase = newPhrase.replace(timeRegex, (match, p1, p2) => {
  //     return replaceHelper(`${p1}${toBritish ? "." : ":"}${p2}`);
  //   });

  //   return hasReplaced ? newPhrase : "Everything looks good to me!";

  //   function replaceHelper(string, pre, post) {
  //     hasReplaced = true;
  //     return  `${pre ? pre : ''}<span class="highlight">${string}</span>${post ? post : ''}`;
  //   }
  // }

  static objectFlip(obj) {
    const ret = {};
    Object.keys(obj).forEach((key) => {
      ret[obj[key]] = key;
    });
    return ret;
  }
}

module.exports = Translator;
