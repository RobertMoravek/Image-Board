import comments from "./comments.js";

const imgCardBig = {
    data: function () {
        return {
            img: {},
            imgId: null,
            prev: null,
            next: null,
            key: 0,
            imageLoading: true,
            hal9000: false,
        };
    },
    props: ["id"],
    methods: {
        closeImgCardBig: function () {
            history.pushState(null, null, "/");
            this.$emit("close");
        },
        prevImage: function () {
            console.log("this.prev", this.prev);
            this.$emit("new", this.prev);
        },
        nextImage: function () {
            console.log("this.next", this.next);
            this.$emit("new", this.next);
        },
        forceRerender: function () {
            this.key++;
        },
        deleteImage: function () {
            // fetch(`/delete/${this.imgId}`).then(() => {
            //     this.$emit("delete", this.imgId);
            //     console.log("nach then");
            //     this.closeImgCardBig();
            // });
            this.hal9000 = true;
        },
        closeHAL9000: function () {
            this.hal9000 = false; 
        },
        imageLoaded: function () {
            this.imageLoading = false;
        },
    },

    template: `
    <div class="imgCardBig">
    <Transition>
    <div v-if="hal9000" @click="closeHAL9000" class="hal9000" id="hal9000">
        <img src="../HAL9000.svg" >
        <h2>I'm sorry, Dave. I'm afraid I can't do that.</h2>
    </div>
    </Transition>
        <div class="imgBox">
            <div class="imgContainer">
            <h1 v-if="imageLoading">Loading</h1>
                <div id="loading-bg-opaque" v-if="imageLoading">
                    <div id="loading-spinner"></div>
                </div>
                <div class="prevArrow" @click="this.imgId = this.prev">◁</div>
                <img v-bind:src="img.url" class="imgImgage" id="bigImg" @load="imageLoaded">
                <div class="nextArrow" @click="this.imgId = this.next">▷</div>
                <div class="closeCross" @click="closeImgCardBig">×</div>
            </div>
            <div class="imgInfo">
            <p class="imgTitle"> {{img.title}} </p>
            <p class="imgDescription"> {{img.description}} </p>
            <p class="imgUser">by {{img.username}} </p>
            <p class="imgTime"> {{img.created_at}} </p>
            <p class="delete" @click="deleteImage">Delete</p>
            </div>
            <comments v-if="this.imgId" :id="this.commentImgId" :key="key"></comments>
        </div>
    </div>
    `,

    watch: {
        imgId: function () {
            console.log(this.imgId);
            fetch(`/dbi/${this.imgId}`)
                .then((imageRows) => {
                    // console.log(imageRows);
                    return imageRows.json();
                })
                .then((imageRows) => {
                    console.log("imageRows", imageRows);
                    for (let item of imageRows) {
                        item.created_at = item.created_at
                            .slice(0, 16)
                            .replace("T", " ");
                    }
                    this.img = imageRows[0];
                    this.imgId = imageRows[0].id;
                    this.prev = imageRows[0].prev;
                    this.next = imageRows[0].next;
                    this.forceRerender();
                });
        },
        // hal9000() {
        //     this.$nextTick(() => {
        //         console.log(document.getElementById("hal9000"));
        //         document.getElementById("hal9000").classList.remove("transparent");

        //     });

        // }
    },
    components: {
        comments: comments,
    },
    computed: {
        commentImgId: function () {
            return this.imgId;
        },
    },

    mounted: function () {
        this.imageLoading = true;
        document.getElementById("body").classList.add("noscroll");
        fetch(`/dbi/${this.id}`)
            .then((imageRows) => {
                // console.log(imageRows);
                return imageRows.json();
            })
            .then((imageRows) => {
                console.log("imageRows", imageRows);
                for (let item of imageRows) {
                    item.created_at = item.created_at
                        .slice(0, 16)
                        .replace("T", " ");
                }
                this.img = imageRows[0];
                this.imgId = imageRows[0].id;
                this.prev = imageRows[0].prev;
                this.next = imageRows[0].next;
            });
    },

    unmounted: function () {
        this.imageLoading = true;
        document.getElementById("body").classList.remove("noscroll");
    },
};

export default imgCardBig;
