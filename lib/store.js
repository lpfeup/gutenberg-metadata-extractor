"use strict";

const path = require("path");
const { sequelize, Book, Author, BookAuthor } = require(path.join(__dirname, "db", "models"));

class Store {
  async init() {
    this.existingAuthors = new Set();
    return sequelize.sync({ force: true });
  }

  async saveBook(book) {
    const transaction = await sequelize.transaction();

    try {
      for (const { id, name, birthDate, webpage, deathDate, aliases } of book.authors) {
        if (!this.existingAuthors.has(id)) {
          this.existingAuthors.add(id);
          await Author.create({ id, name, birthDate, webpage, deathDate, aliases }, { transaction });
        }
      }

      const resultingBook = await Book.create(book, { transaction });

      const bookAuthors = book.authors.map(author => ({ book_id: book.id, author_id: author.id }));
      await BookAuthor.bulkCreate(bookAuthors, { transaction });

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
