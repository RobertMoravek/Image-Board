

const imgCardSmall = {
    data: function () {
        return {
            key: 0,
            imageLoading: true,
        };
    },
    props: ["img"],
    methods: {
        // When image is loaded, turn off loading animation
        imageLoaded: function () {
            this.imageLoading = false;
        },
    },
    template: `
        <div class="small-image-container">
        <div id="loading-bg-opaque" v-if="imageLoading">
            <div id="loading-spinner"></div>
        </div>
        <img v-bind:src="img.url" class="imgImgage" @load="imageLoaded">
        </div>
        <div class="imgInfo">
            <p class="imgTitle">{{img.title}}</p>
            <p class="imgDescription">{{img.description}}</p>
        </div>

    `,

    mounted: function () {
        // start loading animation
        this.imageLoading = true;
    },


};

export default imgCardSmall;
