"use strict";
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    "Book",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      publisher: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      publicationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      language: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      subjects: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
      },
      licenseRights: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
      },
    },
    {
      tableName: "book",
      underscored: true,
      indexes: [
        {
          fields: ["title"],
          using: "BTREE",
        },
        {
          fields: ["publication_date"],
          using: "BTREE",
        },
      ],
    }
  );
  Book.associate = models => {
    Book.belongsToMany(models.Author, {
      through: models.BookAuthor,
      as: "authors",
      foreignKey: "book_id",
      otherKey: "author_id",
    });
  };
  return Book;
};
