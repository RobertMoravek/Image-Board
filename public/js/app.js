import * as Vue from './vue.js';

const app = Vue.createApp({
    data: function () {
        return {
            imageRows: [],
        };
    },
    mathods: {

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