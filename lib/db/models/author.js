"use strict";
module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define(
    "Author",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      birthDate: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      webpage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deathDate: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      aliases: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
      },
    },
    {
      tableName: "author",
      underscored: true,
    }
  );
  Author.associate = models => {
    Author.belongsToMany(models.Book, {
      through: models.BookAuthor,
      as: "books",
      foreignKey: "author_id",
      otherKey: "book_id",
    });
  };
  Author.search = function (query) {
    return sequelize.query(`SELECT * FROM ${this.tableName} WHERE _search @@ plainto_tsquery('english', :query)`, {
      model: Author,
      replacements: { query },
    });
  };
  return Author;
};
