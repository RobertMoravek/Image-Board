const db = require("./db.js");

const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
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

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(8080, () => console.log(`I'm listening.`));
