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
            fetch(`/delete/${this.imgId}`).then(() => {
                this.$emit("delete", this.imgId);
                console.log("nach then");
                this.closeImgCardBig();
            });
        },
        imageLoaded: function () {
            this.imageLoading = false;
        },
    },
    template: `
    <div class="imgCardBig" @click.self="closeImgCardBig">
        <div class="imgBox">
            <div class="imgContainer">
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
};

export default imgCardBig;
