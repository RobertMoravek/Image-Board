
const comments = {
    data: function () {
        return {
            commentRows: [],
            newComment: null,
            username: null,
            error: false,
            message: "",
        };
    },

    template: `
<div id="comments">
    <h3>Comments</h3>
    <div class="commentBox" v-for="comment in commentRows">
        <p class="commentUser">{{comment.username}}</p>
        <p class="comment">{{comment.comment}}</p>
        <p class="commentTime">{{comment.created_at}}</p>
    </div>
    <div class="newComment">
        <h3 id="leaveAComment">Leave a comment!</h3>
        <label for="username">Your name:</label>
        <input type="text" name="username" id="username" v-model="username">
        <label for="newComment">Comment:</label>
        <input type="text" name="newComment" id="newComment" v-model="newComment">
        <p class="error-text" v-if="error">Please fill out both fields before submitting your comment!</p>
        <input type="submit" value="Send Comment" class="submitButton" @click="insertComment">
    </div>
</div>
    `,
    props: ["id"],
    methods: {
        insertComment: function () {
            if (!this.username || !this.newComment) {
                this.error = true;
                return;
            }
            this.error = false;
            let bodyObj = {
                username: this.username,
                comment: this.newComment,
                imageId: this.id,
            };
            bodyObj = JSON.stringify(bodyObj);
            bodyObj;
            fetch("/comments", {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: bodyObj,
            })
                .then((result) => {
                    return result.json();
                })
                .then(({ message, commentInfo }) => {
                    this.message = message;
                    // console.log("commentInfo", commentInfo);
                    commentInfo.created_at = commentInfo.created_at
                        .slice(0, 16)
                        .replace("T", " ");
                    if (commentInfo) {
                        this.commentRows.push({
                            username: commentInfo.username,
                            comment: commentInfo.comment,
                            created_at: commentInfo.created_at,
                        });
                    }
                    this.username = "";
                    this.newComment = "";
                });
        },
    },

    watch: {
        id: function () {
            this.commentRows = [];
            fetch(`/comments/${this.id}`)
                .then((commentRows) => {
                    return commentRows.json();
                })
                .then((commentRows) => {
                    // console.log(commentRows);
                    for (let item of commentRows) {
                        item.created_at = item.created_at
                            .slice(0, 16)
                            .replace("T", " ");
                    }
                    this.commentRows = commentRows;
                });
        },

    },
    mounted: function () {
        this.commentRows = [];
        fetch(`/comments/${this.id}`)
            .then((commentRows) => {
                return commentRows.json();
            })
            .then((commentRows) => {
                // console.log(commentRows);
                for (let item of commentRows) {
                    item.created_at = item.created_at
                        .slice(0, 16)
                        .replace("T", " ");
                }
                this.commentRows = commentRows;
            });
    },
};

export default comments;
