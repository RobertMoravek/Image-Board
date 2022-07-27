const db = require("./db.js");
const {uploader} = require("./middleware.js");

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

app.post("/images", uploader.single("uploadInput"), (req, res) => {
    if(req.file){
        res.json({
            success: true,
            message: "File uploaded",
            file: `/${req.file.filename}`,
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
