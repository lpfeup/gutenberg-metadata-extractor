"use strict";

const { parseStringPromise: parseString } = require("xml2js");

class ContentTreeParser {
  constructor(contentTree) {
    const root = contentTree["rdf:RDF"];
    this.ebook = root["pgterms:ebook"][0];
    this.agents = root["pgterms:agent"];
  }

  get id() {
    return parseInt(this.ebook["$"]["rdf:about"].replace("ebooks/", ""));
  }

  get title() {
    return (this.ebook["dcterms:title"] && this.ebook["dcterms:title"][0]) || null;
  }

  get authors() {
    const agents = (this.ebook["dcterms:creator"] && this.ebook["dcterms:creator"][0]["pgterms:agent"]) || this.agents || [];
    return agents.map(entry => ({
      id: parseInt(entry["$"]["rdf:about"].replace("2009/agents/", "")),
      name: entry["pgterms:name"][0],
      birthDate: (entry["pgterms:birthdate"] && parseInt(entry["pgterms:birthdate"][0]["_"])) || null,
      webpage: (entry["pgterms:webpage"] && entry["pgterms:webpage"][0]["$"]["rdf:resource"]) || null,
      deathDate: (entry["pgterms:deathdate"] && parseInt(entry["pgterms:deathdate"][0]["_"])) || null,
      aliases: entry["pgterms:alias"] || [],
    }));
  }

  get publisher() {
    return this.ebook["dcterms:publisher"][0];
  }

  get publicationDate() {
    return this.ebook["dcterms:issued"][0]["_"];
  }

  get language() {
    const language = this.ebook["dcterms:language"] && this.ebook["dcterms:language"][0];
    if (language) {
      return language["_"] || language["rdf:Description"][0]["rdf:value"][0]["_"];
    }

    return null;
  }

  get subjects() {
    const subjects = this.ebook["dcterms:subject"] || [];
    return subjects
      .map(entry => entry["rdf:Description"][0])
      .filter(entry => entry["dcam:memberOf"][0]["$"]["rdf:resource"].includes("/LCSH"))
      .map(entry => entry["rdf:value"][0]);
  }

  get licenseRights() {
    return this.ebook["dcterms:rights"];
  }
}

class RDFParser {
  async parse(filename, content) {
    try {
      const contentTree = await parseString(content);
      const contentTreeParser = new ContentTreeParser(contentTree);

      return {
        id: contentTreeParser.id,
        title: contentTreeParser.title,
        authors: contentTreeParser.authors,
        publisher: contentTreeParser.publisher,
        publicationDate: contentTreeParser.publicationDate,
        language: contentTreeParser.language,
        subjects: contentTreeParser.subjects,
        licenseRights: contentTreeParser.licenseRights,
      };
    } catch (err) {
      throw new Error(`Error parsing file: ${filename}`, err);
    }
  }
}

module.exports = new RDFParser();
