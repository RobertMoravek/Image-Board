import * as Vue from './vue.js';
import imgCardBig from "./imgCardBig.js";
import imgCardSmall from './imgCardSmall.js';

const app = Vue.createApp({
    data: function () {
        return {
            imageRows: [],
            message: "",
            imageId: 0,
            images: [],
            uploading: false,
            uploadComplete: false,
            title: "",
            description: "",
            imageLoading: true,
            scrollBottomChecker: undefined,
        };
    },
    methods: {
        onFormSubmit(e) {
            this.uploading = true;

            const form = e.currentTarget;
            const fileInput = form.querySelector("input[type=file]");
            if (fileInput.files.length < 1) {
                alert("Add a file, dummy!");
                return;
            }
            const formData = new FormData(form);
            fetch("/dbi", {
                method: "post",
                body: formData,
            })
                .then((result) => {
                    return result.json();
                })
                .then(({ message, imgInfo }) => {
                    this.uploading = false;
                    this.message = message;
                    if (imgInfo.url) {
                        this.uploadComplete = true;
                        this.imageRows.unshift({
                            id: imgInfo.id,
                            url: imgInfo.url,
                            title: imgInfo.title,
                            description: imgInfo.description,
                            user: imgInfo.user,
                        });
                        setTimeout(() => {
                            document.getElementById("uploadForm").classList.remove("expanded");
                            document.getElementById("arrowDown").classList.remove("arrowUp");
                            setTimeout(() => {
                                this.message = "";
                                this.title = "";
                                this.description = "";
                                this.uploadComplete = false;
                            }, 1000);
                        }, 2000);
                    }
                });
        },
        uploadExpander: function (e) {
            if (e.currentTarget.parentNode.classList.contains("expanded")) {
                e.currentTarget.parentNode.classList.remove("expanded");
                e.currentTarget.childNodes[1].classList.remove("arrowUp");
            } else {
                e.currentTarget.parentNode.classList.add("expanded");
                e.currentTarget.childNodes[1].classList.add("arrowUp");
                console.log(e.currentTarget.childNodes);
            }
        },
        loadMoreImages: function () {
            let offsetId = this.imageRows[this.imageRows.length - 1].id;
            // console.log('last ID:', offsetId);
            fetch(`/dbi/${offsetId}m`)
                .then((result) => {
                    // console.log(this.imageRows);
                    return result.json();
                })
                .then((newImageRows) => {
                    // console.log(newImageRows);
                    if (newImageRows.length == 0) {
                        clearInterval(this.scrollBottomChecker);
                    }
                    for (let item of newImageRows) {
                        item.created_at = item.created_at
                            .slice(0, 16)
                            .replace("T", " ");
                    }
                    this.imageRows.push(...newImageRows);
                });
        },
        changeUrl: function (imgId) {
            this.imageId = imgId;
            history.pushState(null, null, `/img/${imgId}`);
        },
        newImage: function (id) {
            this.imageId = id;
            console.log("this.imageId", this.imageId);
        },
        removeImage: function (id) {
            console.log("removeImage running, id:", id);
            let result = this.imageRows.filter((item) => item.id != id);
            this.imageRows = result;
        },
        printArray: function (deletedId) {
            console.log('trying to filter');
            let result = this.imageRows.filter(item => item.id != deletedId);
            this.imageRows = result;
            console.log(this.imageRows);
        },
        scrollToTop: function() {
            window.scroll({ top: 0, left: 0, behavior: "smooth" });
        }
    },
    components: {
        "img-card-big": imgCardBig,
        "img-card-small": imgCardSmall
    },
    computed: {
        checkImageId: function () {
            if (!this.imageId) {
                return false;
            } else {
                return true;
            }
        },
    },
    mounted: function () {
        var prevScrollpos = window.pageYOffset;
        window.onscroll = function () {
            var currentScrollPos = window.pageYOffset;
            if (prevScrollpos > currentScrollPos) {
                document.getElementById("header").classList.remove("offscreen");
            } else {
                document.getElementById("header").classList.add("offscreen");
            }
            prevScrollpos = currentScrollPos;
        }; 


        let tempId;

        if (location.pathname.indexOf("/img/") == 0) {
            tempId = +location.pathname.substring(5);
        }
        if (tempId != isNaN) {
            this.imageId = tempId;
        }

        fetch("/dbi")
            .then((imageRows) => {
                // console.log(imageRows);
                return imageRows.json();
            })
            .then((imageRows) => {
                for (let item of imageRows) {
                    item.created_at = item.created_at
                        .slice(0, 16)
                        .replace("T", " ");
                }
                this.imageRows = imageRows;
            })
            .then(() => {
                this.scrollBottomChecker = setInterval(() => {
                    if (window.scrollMaxY - window.scrollY < 1000) {
                        this.loadMoreImages();
                    }
                }, 250);
            });

        addEventListener("popstate", (e) => {
            let tempId;
            if (location.pathname.indexOf("/img/") == 0) {
                tempId = +location.pathname.substring(5);
            }
            console.log(tempId);
            if (tempId != isNaN) {
                this.imageId = tempId;
            }
        });
    },
});

app.mount("#bodydiv");