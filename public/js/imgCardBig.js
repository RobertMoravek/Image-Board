import comments from "./comments.js";

const imgCardBig = {
    data: function () {
        return {
            img: {},
        };
    },
    props: ["id"],
    methods: {
        closeImgCardBig: function () {
            console.log("close img");
            this.$emit("close");
        },
    },
    template: `
    <div class="imgCardBig" @click.self="closeImgCardBig">
        <div class="imgBox">
            <img v-bind:src="img.url" class="imgImgage" id="bigImg">
            <div class="imgInfo">
                <p class="imgTitle"> {{img.title}} </p>
                <p class="imgDescription"> {{img.description}} </p>
                <p class="imgUser">by {{img.username}} </p>
                <p class="imgTime"> {{img.created_at}} </p>
            </div>
            <comments :id="id"></comments>
        </div>
    </div>
    `,
    components: {
        comments: comments,
    },
    mounted: function () {
        console.log("mounted component");
        fetch(`/images/${this.id}`)
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
                imageRows = imageRows.reverse();
                this.img = imageRows[0];
            });
    },
};

export default imgCardBig;
