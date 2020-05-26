"use strict";

const path = require("path");
const { promises: fs } = require("fs");

class RDFProcessor {
  constructor(rdfParser, store) {
    this.rdfParser = rdfParser;
    this.store = store;
  }

  async process(file) {
    const filename = path.basename(file);
    try {
      const result = await this.rdfParser.parse(filename, await fs.readFile(file));
      return this.store.saveBook(result);
    } catch (err) {
      throw new Error(`Error processing file: ${filename}`, err);
    }
  }
}

module.exports = (rdfParser, store) => new RDFProcessor(rdfParser, store);
