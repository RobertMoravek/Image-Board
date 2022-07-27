let dbUrl;
if (process.env.NODE_ENV == "production") {
    dbUrl = process.env.DATABASE_URL;
} else {
    const { user, password, database } = require("./secrets.json");
    dbUrl = `postgres:${user}:${password}@localhost:5432/${database}`;
}

const spicedPg = require("spiced-pg");
const db = spicedPg(dbUrl);

module.exports.getImages = () => {
    return db.query(`SELECT * FROM images`);
};

module.exports.insertImage = (url, title, description, username) => {
    return db.query(
        `INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)`,
        [url, username, title, description]
    );
};