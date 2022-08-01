import comments from "./comments.js";

const imgCardBig = {
    data: function () {
        return {
            img: {},
            imgId: null,
            prev: null,
            next: null,
            key: 0,
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
            fetch(`/delete/${this.imgId}`)
                .then(() => {
                    console.log('nach then');
                    this.$emit("delete", this.imgId);
                    this.closeImgCardBig();
                });
        },
    },
    template: `
    <div class="imgCardBig" @click.self="closeImgCardBig">
        <div class="imgBox">
            <div class="imgContainer">
                <div class="prevArrow" @click="this.imgId = this.prev">◁</div>
                <img v-bind:src="img.url" class="imgImgage" id="bigImg">
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
        console.log("mounted component");
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
