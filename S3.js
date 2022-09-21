const aws = require('aws-sdk');
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // in dev they are in secrets.json which is listed in .gitignore
}

// Create a new AWS S3 instance with the ID and key
const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

exports.upload = (req, res, next) => {
    // If there is no file, return a server errror 
    if(!req.file) {
        return res.sendStatus(500);
    }

    const { filename, mimetype, size, path } = req.file;
    // Otherwise upload it to S3
    const promise = s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise();

    promise
        .then(() => {
            console.log('Amamzon Upload successful');
            next();
            // fs.unlink(path, () => {}); delete from local server
        })
        .catch((err) => {
            // uh oh
            console.log("Error in S3.js:", err);
            res.sendStatus(404);
        });

};