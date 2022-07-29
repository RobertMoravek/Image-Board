import * as Vue from './vue.js';
import imgCardBig from "./imgCardBig.js";

const app = Vue.createApp({
    data: function () {
        return {
            imageRows: [],
            images: [],
            message: "",
            imageId: 0,
        };
    },
    methods: {

        test: function () {
            console.log('event received');
        },
        onFormSubmit(e) {
            // e.preventDefault; instead do it in the html
            const form = e.currentTarget;
            const fileInput = form.querySelector("input[type=file]");
            if (fileInput.files.length < 1) {
                alert("Add a file, dummy!");
                return;
            }
            const formData = new FormData(form);
            fetch("/images", {
                method: "post",
                body: formData,
            })
                .then((result) => {
                    return result.json();
                })
                .then(({message, imgInfo}) => {
                    this.message = message;
                    if (imgInfo.url){
                        this.imageRows.unshift({id: imgInfo.id, url: imgInfo.url, title: imgInfo.title, description: imgInfo.description, user: imgInfo.user});

                    }
                });
        },
        uploadExpander: function (e){
            if (e.currentTarget.parentNode.classList.contains("expanded")){
                e.currentTarget.parentNode.classList.remove("expanded");
                e.currentTarget.childNodes[1].classList.remove("arrowUp");

            } else {
                e.currentTarget.parentNode.classList.add("expanded");
                e.currentTarget.childNodes[1].classList.add("arrowUp");
                console.log(e.currentTarget.childNodes);
                
                
            }
        },
        loadMoreImages: function () {
            let offsetId = this.imageRows[this.imageRows.length-1].id;
            // console.log('last ID:', offsetId);
            fetch(`/images/${offsetId}m`)
                .then((result) => {
                    // console.log(this.imageRows);
                    return result.json();
                })
                .then((newImageRows) => {
                    // console.log(newImageRows);
                    for (let item of newImageRows) {
                        item.created_at = item.created_at
                            .slice(0, 16)
                            .replace("T", " ");
                    }
                    this.imageRows.push(...newImageRows);
                });
        }
    },
    components: {
        "img-card-big": imgCardBig,
    },

    mounted: function () {
        fetch("/images")
            .then((imageRows) => {
                // console.log(imageRows);
                return imageRows.json();
            })
            .then((imageRows) => {
                console.log(imageRows);
                for (let item of imageRows){
                    item.created_at = item.created_at.slice(0, 16).replace("T", " ");
                }
                this.imageRows = imageRows;
            })
            .then(() => {
                setInterval(() => {
                    if (window.scrollMaxY - window.scrollY < 1000) {
                        this.loadMoreImages();
                    }
                }, 250);
            });
        

    }
});

app.mount("#bodydiv");