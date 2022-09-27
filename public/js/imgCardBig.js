import comments from "./comments.js";

const imgCardBig = {
    data: function () {
        return {
            img: {},
            imgId: null,
            prev: null,
            next: null,
            imageLoading: true,
            hal9000: false,
        };
    },
    props: ["id"],
    methods: {
        // When big view is closed, reset url and emit close event to app.js
        closeImgCardBig: function () {
            history.pushState(null, null, "/");
            this.$emit("close");
        },

        // When user clicks delete...
        deleteImage: function () {

            // Actuall delete code (not in use for deployment)
            // fetch(`/delete/${this.imgId}`).then(() => {
            //     this.$emit("delete", this.imgId);
            //     console.log("nach then");
            //     this.closeImgCardBig();
            // });

            // Activate HAL9000 ;-)
            this.hal9000 = true;
        },

        // Close HL9000
        closeHAL9000: function () {
            this.hal9000 = false; 
        },

        // When image has finished loading, set variable for loading animation to false
        imageLoaded: function () {
            this.imageLoading = false;
        },
    },

    template: `
    <div class="imgCardBig">
    <Transition>
    <div v-if="hal9000" @click="closeHAL9000" class="hal9000" id="hal9000">
        <img src="../HAL9000.svg" >
        <h2>I'm sorry, Dave.<br>I'm afraid I can't do that.</h2>
    </div>
    </Transition>
        <div class="imgBox">
            <div class="imgContainer">
            <h1 v-if="imageLoading">Loading</h1>
                <div id="loading-bg-opaque" v-if="imageLoading">
                    <div id="loading-spinner"></div>
                </div>
                <div class="prevArrow" @click="this.imgId = this.prev" v-if="this.prev">◁</div>
                <img v-bind:src="img.url" class="imgImgage" id="bigImg" @load="imageLoaded">
                <div class="nextArrow" @click="this.imgId = this.next" v-if="this.next">▷</div>
                <div class="closeCross" @click="closeImgCardBig">×</div>
            </div>
            <div class="imgInfo">
            <p class="imgTitleBig"> {{img.title}} </p>
            <p class="imgDescriptionBig"> {{img.description}} </p>
            <p class="imgUser">by {{img.username}} </p>
            <p class="imgTime"> {{img.created_at}} </p>
            <p class="delete" @click="deleteImage">Delete</p>
            </div>
            <comments v-if="this.imgId" :id="this.imgId"></comments>
        </div>
    </div>
    `,

    watch: {
        // When the chosen imgId changes, fetch the corresponding image
        imgId: function () {
            // console.log(this.imgId);
            fetch(`/dbi/${this.imgId}`)
                .then((imageRows) => {
                    // console.log(imageRows);
                    return imageRows.json();
                })
                .then((imageRows) => {
                    // console.log("imageRows", imageRows);
                    for (let item of imageRows) {
                        item.created_at = item.created_at
                            .slice(0, 16)
                            .replace("T", " ");
                    }
                    this.img = imageRows[0];
                    this.imgId = imageRows[0].id;
                    this.next = imageRows[0].prev;
                    this.prev = imageRows[0].next;
                    // Set url for new image
                    history.pushState(null, null, "/img/"+ this.imgId);
                });
        },

    },
    components: {
        comments: comments,
    },


    mounted: function () {
        // Activate loading animation and stop scrolling for background (canvas of all loaded images)
        this.imageLoading = true;
        document.getElementById("body").classList.add("noscroll");

        // Fetch the chosen image
        fetch(`/dbi/${this.id}`)
            .then((imageRows) => {
                // console.log(imageRows);
                return imageRows.json();
            })
            .then((imageRows) => {
                if (imageRows.length > 0) {
                    for (let item of imageRows) {
                        item.created_at = item.created_at
                            .slice(0, 16)
                            .replace("T", " ");
                    }
                    this.img = imageRows[0];
                    this.imgId = imageRows[0].id;
                    this.prev = imageRows[0].prev;
                    this.next = imageRows[0].next;
                } else {
                    // If an image could not be loaded, close the component and reset the url
                    this.$emit("close");
                    history.pushState(null, null, "/");
                }
            });
    },

    unmounted: function () {
        // On unmount, activate scrolling for image canvas again
        document.getElementById("body").classList.remove("noscroll");
    },
};

export default imgCardBig;
