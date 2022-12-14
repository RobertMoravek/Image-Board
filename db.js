// get DB credentials according to environment
let dbUrl;
if (process.env.NODE_ENV == "production") {
    dbUrl = process.env.DATABASE_URL;
} else {
    const { user, password, database } = require("./secrets.json");
    dbUrl = `postgres:${user}:${password}@localhost:5432/${database}`;
}

// Spice's own postgresql db integration module
const spicedPg = require("spiced-pg");
const db = spicedPg(dbUrl);

// Get images
module.exports.getImages = (id, offsetId) => {
    // Get previous and next image, using image id
    if (id) {
        return db.query(
            `SELECT *, (SELECT id FROM images WHERE id<$1 ORDER BY id DESC LIMIT 1) as "prev", (SELECT id FROM images WHERE id>$1 ORDER BY id LIMIT 1) as "next" FROM images WHERE id=$1`,
            [id]
        );}
    // Get 4 more recent pictures using offset
    if (offsetId){
        return db.query(
            `SELECT *, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS "lowestId"  FROM images WHERE id<$1 ORDER BY id DESC LIMIT 4`,
            [offsetId]
        );
    }
    // Get the 8 most recent images
    return db.query(`SELECT * FROM images ORDER BY id DESC LIMIT 8`);
};

// Insert an already uploaded image into the db
module.exports.insertImage = (url, title, description, username) => {
    return db.query(
        `INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4) RETURNING id, url, username, title, description`,
        [url, username, title, description]
    );
};

// Insert a comment into the db
module.exports.insertComment = (imageId, comment, username) => {
    return db.query(
        `INSERT INTO comments (imageId, comment, username)
        VALUES ($1, $2, $3) RETURNING *`,
        [imageId, comment, username]
    );
};

// Get comments for a certain image using its id
module.exports.getComments = (imageId) => {
    return db.query(`SELECT * FROM comments WHERE imageid=$1`, [imageId]);
};

// Delete entry for an image
module.exports.deleteImage = (imageId) => {
    return db.query(`DELETE FROM images WHERE id=$1`, [imageId]);
};