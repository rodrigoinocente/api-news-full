import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    dataLikes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "",
        default: null,
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    dataComments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "",
        default: null,
    },
    commentsCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        required: true,
    },
});

export default NewsSchema;