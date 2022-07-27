import * as Vue from './vue.js';

const app = Vue.createApp({
    data: function () {
        return {
            imageRows: [],
            images: [],
            message: "",
        };
    },
    methods: {
        onFormSubmit(e) {
            // e.preventDefault; instead do it in the html
            console.log('form submit stopped');
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
                .then((result) => {
                    this.message = result.message;
                    if (result.file){
                        this.imageRows.unshift({url: result.file});
                    }
                });
        }
    },
    mounted: function () {
        fetch("/images")
            .then((imageRows) => {
                // console.log(imageRows);
                return imageRows.json();
            })
            .then((imageRows) => {
                for (let item of imageRows){
                    item.created_at = item.created_at.slice(0, 16).replace("T", " ");
                }
                this.imageRows = imageRows;
            });
    }
});

app.mount("#main");