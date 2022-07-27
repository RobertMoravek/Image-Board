const db = require("./db.js");
const {uploader} = require("./middleware.js");
const s3 = require ("./S3.js");

const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json());


app.get("/images", (req, res) => {
    db.getImages()
        .then((imageResult) => {
            // console.log(imageResult.rows);
            res.json(imageResult.rows);
            return;
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post("/images", uploader.single("uploadInput"), s3.upload, (req, res) => {
    console.log('req.body', req.body);
    console.log('req.file', req.file);
    if(req.file){
        let amazonUrl = "https://s3.amazonaws.com/spicedling/" + req.file.filename;
        db.insertImage(amazonUrl, req.body.uploadTitle, req.body.uploadDescription, "tempUser")
            .then(() => {
                res.json({
                    success: true,
                    message: "File uploaded",
                    url: amazonUrl,
                    title: req.body.uploadTitle,
                    description: req.body.uploadDescription,
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
