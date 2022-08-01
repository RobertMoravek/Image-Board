const db = require("./db.js");
const {uploader} = require("./middleware.js");
const s3 = require ("./S3.js");

const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json());

app.get("/dbi/:id", (req, res) => {
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

app.post("/dbi", uploader.single("uploadInput"), s3.upload, (req, res) => {
    console.log('req.body', req.body);
    console.log('req.file', req.file);
    if(req.file){
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

app.get("/delete/:id", (req, res) => {
    db.deleteImage(req.params.id)
        .then(() => {
            console.log('deleted');
            res.send("done");
            return;
        });
});

app.get("/comments/:id", (req, res) => {
    if (req.params.id.endsWith("m")) {
        // db.getImages(null, req.params.id.slice(0, -1))
        //     .then((imageResult) => {
        //         console.log(imageResult.rows);
        //         res.json(imageResult.rows);
        //         return;
        //     })
        //     .catch((err) => {
        //         console.log("error in get /images/id with m", err);
        //     });
    } else {
        db.getComments(req.params.id)
            .then((commentResults) => {
                // console.log(imageResult.rows);
                res.json(commentResults.rows);
                return;
            })
            .catch((err) => {
                console.log("error in get /images/id without m", err);
            });
    }
});

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

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(8080, () => console.log(`I'm listening.`));
