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