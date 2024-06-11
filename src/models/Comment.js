import mongoose from "mongoose";
import { NewsModel, CommentModel } from "../database/db.js"

const CommentSchema = new mongoose.Schema({
    newsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "News",
        required: true,
    },
    comment: {
        type: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            dataLike: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "",
                default: null,
            },
            dataReply: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "",
                default: null,
            },
            likeCount: {
                type: Number,
                default: 0,
            },
            replyCount: {
                type: Number,
                default: 0,
            },
            createdAt: {
                type: Date,
                default: Date.now(),
                required: true
            },
        }]
    },
});

CommentSchema.post('save', async function () {
    const news = await NewsModel.findById(this.newsId);
    news.commentCount = this.comment.length;
    await news.save();
});

CommentSchema.post('findOneAndUpdate', async function () {
    const commentsId = this.getQuery();
    const dataCommentsUpdate = await CommentModel.findById(commentsId);

    const news = await NewsModel.findById(dataCommentsUpdate.newsId);
    news.commentCount = dataCommentsUpdate.comment.length;
    await news.save();
});

export default CommentSchema;