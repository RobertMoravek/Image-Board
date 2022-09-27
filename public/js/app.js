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
            fileTooLarge: false,
            fileTypeWrong: false,
            titleEmpty: false,
        };
    },
    methods: {
        // When upload frm is submitted...
        onFormSubmit(e) {
            // Do nothing if file is too large or wrong type (see fileChecker)
            if (this.fileTooLarge || this.fileTypeWrong ) {
                return;
            }
            // Same for empty title field
            if (!this.title) {
                this.titleEmpty = true;
                return;
            } else {
                this.titleEmpty = false;
            }
            
            // Get the form
            const form = e.currentTarget;
            const fileInput = form.querySelector("input[type=file]");
            
            // If there is no file, show alert and abort
            if (fileInput.files.length < 1) {
                alert("Add a file, dummy!");
                return;
            }

            // If everthing is alright, set ulpoading to true, thereby starting loading animation
            this.uploading = true;

            // Post the data to the server
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
                    // If you get infos about the uploaded file back, create a new object in the imageRows with this info
                    if (imgInfo.url) {
                        this.uploadComplete = true;
                        this.imageRows.unshift({
                            id: imgInfo.id,
                            url: imgInfo.url,
                            title: imgInfo.title,
                            description: imgInfo.description,
                            user: imgInfo.user,
                        });
                        // After 2 seconds collapse the upload module, after another second (length of anomation) delete the fields
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
                })
                .catch(() => {
                    //  If the server encountred a problem, stop loading animation and set filetypewrong (most likely cause)
                    this.uploading = false;
                    this.fileTypeWrong = true;
                });
        },
        // Change the size of the upload module to show the fields
        uploadExpander: function (e) {
            if (e.currentTarget.parentNode.classList.contains("expanded")) {
                e.currentTarget.parentNode.classList.remove("expanded");
                e.currentTarget.childNodes[1].classList.remove("arrowUp");
            } else {
                e.currentTarget.parentNode.classList.add("expanded");
                e.currentTarget.childNodes[1].classList.add("arrowUp");
            }
        },

        // Immediately when a file is selected check its size and type and set a flag if too big / wrong
        fileChecker: function (e) {
            if (e.target.files[0].size > 2097152) {
                this.fileTooLarge = true;
            } else {
                this.fileTooLarge = false;
            }
            if (
                e.target.files[0].type == "image/jpeg" ||
                e.target.files[0].type == "image/png"
            ) {
                this.fileTypeWrong = false;
            } else {
                this.fileTypeWrong = true;
            }

        },

        // Load more images, with the id of the last image as the offset
        loadMoreImages: function () {
            let offsetId = this.imageRows[this.imageRows.length - 1].id;
            fetch(`/dbi/${offsetId}m`)
                .then((result) => {
                    return result.json();
                })
                .then((newImageRows) => {
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

        // Change the url, if a imageId is set and an overlay with that image is displayed
        changeUrl: function (imgId) {
            this.imageId = imgId;
            history.pushState(null, null, `/img/${imgId}`);
        },

        // Remove a deleted image from the array of images to be displayed
        updateArray: function (deletedId) {
            let result = this.imageRows.filter(item => item.id != deletedId);
            this.imageRows = result;
            // console.log(this.imageRows);
        },

        // Scroll to top of page, if Logo is clicked
        scrollToTop: function() {
            window.scroll({ top: 0, left: 0, behavior: "smooth" });
        }
    },

    components: {
        "img-card-big": imgCardBig,
        "img-card-small": imgCardSmall
    },

    mounted: function () {
        // Detect scrolling and hide/show menu according to scroll direction
        var prevScrollpos = window.pageYOffset;
        window.onscroll = function () {
            var currentScrollPos = window.pageYOffset;
            if (prevScrollpos > currentScrollPos) {
                document.getElementById("header").classList.remove("offscreen");
            } else {
                document.getElementById("header").classList.add("offscreen");
                document.getElementById("uploadForm").classList.remove("expanded");
                document.getElementById("arrowDown").classList.remove("arrowUp");
            }
            prevScrollpos = currentScrollPos;
        }; 

        // If there is an URL with "/img/###" and ### is a number, than open that image
        let tempId;
        if (location.pathname.indexOf("/img/") == 0) {
            tempId = +location.pathname.substring(5);
        }
        if (tempId != isNaN) {
            this.imageId = tempId;
        }

        // Fetch the 8 latest images
        fetch("/dbi")
            .then((imageRows) => {
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
                // Every 250ms check, if the user has scrolled near the bottom of the page and load more pictures, if so
                this.scrollBottomChecker = setInterval(() => {
                    if (document.body.scrollHeight - window.scrollY < 1000) {
                        this.loadMoreImages();
                    }
                }, 250);
            });

        // Listen for user induced states to the browser state and change views to that image, if applicable
        addEventListener("popstate", () => {
            let tempId;
            if (location.pathname.indexOf("/img/") == 0) {
                tempId = +location.pathname.substring(5);
            }
            // console.log(tempId);
            if (tempId != isNaN) {
                this.imageId = tempId;
            }
        });
    },
});

app.mount("#bodydiv");