"use strict";

const path = require("path");
const { sequelize, Book, Author, BookAuthor } = require(path.join(__dirname, "db", "models"));

class Store {
  async init() {
    this.existingAuthors = new Set();
    return initDatabase();
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

  async searchBook(query) {
    return Book.search(query);
  }

  async searchAuthor(query) {
    return Author.search(query);
  }

  async close() {
    return sequelize.close();
  }
}

async function initDatabase() {
  await sequelize.sync({ force: true });

  // add full text search support
  const vectorName = "_search";
  const searchObjects = {
    author: ["name"],
    book: ["title"],
  };

  return sequelize.transaction(transaction =>
    Promise.all(
      Object.keys(searchObjects).map(async table => {
        await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${vectorName} TSVECTOR;`, { transaction });
        await sequelize.query(`UPDATE ${table} SET ${vectorName} = to_tsvector('english', ${searchObjects[table].join(" || ' ' || ")});`, {
          transaction,
        });
        await sequelize.query(`CREATE INDEX ${table}_search ON ${table} USING gin(${vectorName});`, { transaction });
        await sequelize.query(
          `
            CREATE TRIGGER ${table}_vector_update
            BEFORE INSERT OR UPDATE ON ${table}
            FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(${vectorName}, 'pg_catalog.english', ${searchObjects[table].join(", ")});
          `,
          { transaction }
        );
      })
    )
  );
}

module.exports = new Store();
