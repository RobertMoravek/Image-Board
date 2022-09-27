const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");


// Create a storage method
const storage = multer.diskStorage({
    destination: path.join(__dirname, "uploads"),
    filename: (req, file, callback) => {
        uidSafe(24).then((uid) => {
            const extension = path.extname(file.originalname);
            const newFileName = uid + extension;
            callback(null, newFileName);
        });
    }
});

// Use the storage to store files locally and return the filename
module.exports.uploader = multer({
    storage: storage,
    limits: {
        fileSize: 2097152,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Wrong filetype"));
        }
    }
});