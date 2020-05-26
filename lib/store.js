"use strict";

const path = require("path");
const { sequelize, Book, Author } = require(path.join(__dirname, "db", "models"));

class Store {
  async init() {
    return sequelize.sync({ force: true });
  }

  async saveBook(book) {
    const transaction = await sequelize.transaction();

    try {
      const authors = [];

      for (const { id, name, birthDate, webpage, deathDate, aliases } of book.authors) {
        const [author] = await Author.findOrCreate({
          where: { id },
          defaults: { id, name, birthDate, webpage, deathDate, aliases },
          transaction,
        });

        authors.push(author);
      }

      const resultingBook = await Book.create(book, { transaction });
      await resultingBook.setAuthors(authors, { transaction });

      await transaction.commit();

      return resultingBook;
    } catch (err) {
      await transaction.rollback();

      throw new Error(`Error persisting Book with id: ${book.id}`, err);
    }
  }

  async findBookById(id) {
    return Book.findByPk(id, { include: ["authors"] });
  }

  async close() {
    return sequelize.close();
  }
}

module.exports = new Store();
