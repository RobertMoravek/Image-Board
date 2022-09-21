const db = require("./db.js");
const {uploader} = require("./middleware.js"); // Multer
const s3 = require ("./S3.js");

const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));

//parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());

// Route to load the 8 latest images
app.get("/dbi", (req, res) => {
    db.getImages()
        .then((imageResult) => {
            console.log(imageResult.rows);
            res.json(imageResult.rows);
            return;
        })
        .catch((err) => {
            console.log(err);
        });
});

// Unneccessarily complicated route to get more images and the previous/next image
app.get("/dbi/:id", (req, res) => {
    //if the requested image id ends with an m (for "more"), then slice the "m" off and make the db call with it as an offset to get 4 more recent pictures
    if(req.params.id.endsWith("m")){
        db.getImages(null, req.params.id.slice(0, -1))
            .then((imageResult) => {
                console.log(imageResult.rows);
                res.json(imageResult.rows);
                return;
            })
            .catch((err) => {
                console.log("error in get /images/id with m", err);
            }); 
    } else {
        // Otherwise use the id to get the previous and next image to it
        db.getImages(req.params.id)
            .then((imageResult) => {
                res.json(imageResult.rows);
                return;
            })
            .catch((err) => {
                console.log("error in get /images/id without m", err);
            });
    }
    
});

// Image upload route: Send it through Multer and S3 Upload first
app.post("/dbi", uploader.single("uploadInput"), s3.upload, (req, res) => {
    console.log('req.body', req.body);
    console.log('req.file', req.file);
    // If it works and there is a file...
    if(req.file){
        // ... create the Amazon-Link and put it in the db
        let amazonUrl = "https://s3.amazonaws.com/spicedling/" + req.file.filename;
        db.insertImage(amazonUrl, req.body.uploadTitle, req.body.uploadDescription, "tempUser")
            .then((result) => {
                res.json({
                    success: true,
                    message: "File uploaded",
                    imgInfo: result.rows[0]
                });
            });
    } else {
        res.json({
            success: false,
            message: "Upload failed",
        });
    }
});


// Route to delete an image (from the db) -- Deletion from S3 is still to come
app.get("/delete/:id", (req, res) => {
    db.deleteImage(req.params.id)
        .then(() => {
            console.log('deleted');
            res.send("done");
            return;
        });
});


// Route to get comments by image id
app.get("/comments/:id", (req, res) => {
    db.getComments(req.params.id)
        .then((commentResults) => {
            // console.log(imageResult.rows);
            res.json(commentResults.rows);
            return;
        })
        .catch((err) => {
            console.log("error in get /images/id without m", err);
        });
    
});

// Posting comments
app.post("/comments", (req, res) => {
    console.log("req.body", req.body);
    if (req.body.username && req.body.comment && req.body.imageId) {
        db.insertComment(
            req.body.imageId,
            req.body.comment,
            req.body.username
        )  
            .then((result) => {
                res.json({
                    success: true,
                    message: "Comment posted",
                    commentInfo: result.rows[0],
                });
            });
    } else {
        res.json({
            success: false,
            message: "Upload failed",
        });
    }
});

// Catch-all
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(8080, () => console.log(`I'm listening on 8080.`));
