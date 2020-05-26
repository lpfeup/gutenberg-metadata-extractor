"use strict";

const path = require("path");
const { promises: fs } = require("fs");
const { assert } = require("chai");
const rdfParser = require(path.join(__dirname, "..", "lib", "rdf-parser"));
const store = require(path.join(__dirname, "..", "lib", "store"));
const rdfProcessor = require(path.join(__dirname, "..", "lib", "rdf-processor"))(rdfParser, store);

async function parseRDF(filename) {
  const inputFile = path.join(__dirname, "input", `${filename}.rdf`);
  const content = await fs.readFile(inputFile);
  return rdfParser.parse(filename, content);
}

async function parseRDFAndMatchOutput(filename) {
  const outputFile = path.join(__dirname, "output", `${filename}.json`);
  const expectedOutput = JSON.parse(await fs.readFile(outputFile));
  const actualOutput = await parseRDF(filename);

  assert.deepEqual(actualOutput, expectedOutput);
}

async function saveBookAndMatchFields(filename) {
  const inputFile = path.join(__dirname, "input", `${filename}.json`);
  const book = JSON.parse(await fs.readFile(inputFile));

  await store.saveBook(book);

  return matchSavedBook(book.id, book);
}

async function matchSavedBook(bookId, expectedOutput) {
  const savedBook = await store.findBookById(bookId);

  const actualOutput = {
    id: savedBook.id,
    title: savedBook.title,
    publisher: savedBook.publisher,
    publicationDate: savedBook.publicationDate,
    language: savedBook.language,
    subjects: savedBook.subjects,
    licenseRights: savedBook.licenseRights,
    authors: savedBook.authors.map(author => ({
      id: author.id,
      name: author.name,
      birthDate: author.birthDate,
      webpage: author.webpage,
      deathDate: author.deathDate,
      aliases: author.aliases,
    })),
  };

  assert.deepEqual(actualOutput, expectedOutput);
}

describe("Metadata Extractor", function () {
  after(function () {
    return store.close();
  });

  describe("RDFParser", function () {
    it("should fail to parse invalid RDF", async function () {
      const filename = "invalid";
      try {
        await parseRDF(filename);
        assert.fail("Should have thrown exception");
      } catch (err) {
        assert.equal(err.message, `Error parsing file: ${filename}`);
      }
    });

    it("should successfully parse RDF including all fields", async function () {
      return parseRDFAndMatchOutput("all-1");
    });

    it("should successfully parse RDF without title", async function () {
      return parseRDFAndMatchOutput("no-title-58872");
    });

    it("should successfully parse RDF without authors", async function () {
      return parseRDFAndMatchOutput("no-authors-10");
    });

    it("should successfully parse RDF without author birthdate", async function () {
      return parseRDFAndMatchOutput("no-author-birthdate-10000");
    });

    it("should successfully parse RDF without author alias", async function () {
      return parseRDFAndMatchOutput("no-author-alias-10002");
    });

    it("should successfully parse RDF without author webpage", async function () {
      return parseRDFAndMatchOutput("no-author-webpage-10023");
    });

    it("should successfully parse RDF without author deathdate", async function () {
      return parseRDFAndMatchOutput("no-author-deathdate-10011");
    });

    it("should successfully parse RDF without subjects", async function () {
      return parseRDFAndMatchOutput("no-subjects-1073");
    });

    it("should successfully parse RDF with special language format", async function () {
      return parseRDFAndMatchOutput("special-language-format-999999");
    });

    it("should successfully parse RDF with special authors format", async function () {
      return parseRDFAndMatchOutput("special-authors-format-999999");
    });
  });

  describe("Store", function () {
    beforeEach(function () {
      return store.init();
    });

    it("should fail to store invalid Book", async function () {
      try {
        await store.saveBook({});
        assert.fail("Should have thrown exception");
      } catch (err) {
        assert.equal(err.message, "Error persisting Book with id: undefined");
      }
    });

    it("should successfully store book including all fields", async function () {
      return saveBookAndMatchFields("book1-author1");
    });

    it("should successfully store multiple books with same author", async function () {
      await saveBookAndMatchFields("book1-author1");
      return saveBookAndMatchFields("book2-author1");
    });

    it("should successfully store book without authors", async function () {
      await saveBookAndMatchFields("book1-no-authors");
    });
  });

  describe("RDFProcessor", function () {
    beforeEach(function () {
      return store.init();
    });

    it("should fail to parse and persist invalid RDF", async function () {
      const filename = "invalid.rdf";
      try {
        const inputFile = path.join(__dirname, "input", filename);
        await rdfProcessor.process(inputFile);
        assert.fail("Should have thrown exception");
      } catch (err) {
        assert.equal(err.message, `Error processing file: ${filename}`);
      }
    });

    it("should successfully parse and persist valid RDF", async function () {
      const filename = "all-1";
      const inputFileRdf = path.join(__dirname, "input", `${filename}.rdf`);
      await rdfProcessor.process(inputFileRdf);

      const inputFileJson = path.join(__dirname, "input", `${filename}.json`);
      const book = JSON.parse(await fs.readFile(inputFileJson));
      await matchSavedBook(book.id, book);
    });
  });
});
