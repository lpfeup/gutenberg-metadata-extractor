"use strict";
module.exports = sequelize => {
  const BookAuthor = sequelize.define(
    "BookAuthor",
    {},
    {
      tableName: "book_author",
      underscored: true,
      indexes: [
        {
          fields: ["book_id"],
          using: "BTREE",
        },
        {
          fields: ["author_id"],
          using: "BTREE",
        },
      ],
    }
  );
  return BookAuthor;
};
