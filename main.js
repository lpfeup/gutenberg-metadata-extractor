"use strict";

const path = require("path");
const { promises: fs } = require("fs");
const { program } = require("commander");
const rdfParser = require(path.join(__dirname, "lib", "rdf-parser"));
const store = require(path.join(__dirname, "lib", "store"));
const rdfProcessor = require(path.join(__dirname, "lib", "rdf-processor"))(rdfParser, store);

async function getDirectoryDescendantFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries.map(entry => {
    const entryPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      return getDirectoryDescendantFiles(entryPath);
    }
    return entryPath;
  });

  const result = await Promise.all(files);
  return result.flat();
}

async function processFile(file) {
  try {
    console.time();
    await rdfProcessor.process(file);
    console.log("DONE");
    console.timeEnd();
  } catch (err) {
    console.error(err);
  }
}

async function processDir(dir) {
  try {
    console.time();
    const files = await getDirectoryDescendantFiles(dir);
    for (const file of files) {
      try {
        await rdfProcessor.process(file);
      } catch (err) {
        console.error(err);
      }
    }
    console.log("DONE");
    console.timeEnd();
  } catch (err) {
    console.error(err);
  }
}

(async () => {
  program.option("-d, --dir <dir>", "RDF files directory");
  program.option("-f, --file <file>", "RDF file");
  program.parse(process.argv);

  if (!!program.dir === !!program.file) {
    program.help();
  }

  await store.init();

  if (program.dir) {
    await processDir(program.dir);
  }
  if (program.file) {
    await processFile(program.file);
  }

  await store.close();
})();
