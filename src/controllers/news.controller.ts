import { Types } from "mongoose";
import { ICommentNews, ILikeNews, INews, IReplyComment } from "../../custom";
import newsService from "../services/news.service";
import { Request, Response } from "express"

const create = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { title, text, banner } = req.body;

        if (!title && !text && !banner) {
            return res.status(400).send({ message: "Submit all fields for registration" });
        }

        const news: INews = await newsService.createNewsService({
            title,
            text,
            banner,
            user: res.locals.userId,
        });

        res.status(201).send(news);

    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const findAll = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        let limit = req.query.limit ? Number(req.query.limit) : 5;
        let offset = req.query.offset ? Number(req.query.offset) : 0;

        const news: INews[] = await newsService.findAllNewsService(offset, limit);
        const total: number = await newsService.countNewsService();
        const currentUrl = req.baseUrl;

        const next = offset + limit;
        const nextUrl = next < total ? `${currentUrl}?limit=${limit}&offset=${next}` : null;

        const previous = offset - limit < 0 ? null : offset - limit;
        const previousUrl = previous != null ? `${currentUrl}?limit=${limit}&offset=${previous}` : null;

        if (news.length === 0) {
            return res.status(204).send();
        }

        res.status(200).send({
            nextUrl,
            previousUrl,
            limit,
            offset,
            total,
            news
        });
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const topNews = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const news: INews | null = await newsService.topNewsService();
        if (news) {
            return res.send(news);
        } else {
            return res.status(204).send();
        }
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const findById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const news: INews = res.locals.news;
        return res.send(news);

    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const searchByTitle = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { title } = req.query;

        const news: INews[] | null = await newsService.searchByTitleService(title as string);
        if (news.length === 0) {
            return res.status(204).send();
        }

        return res.send(news);
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const newsByUser = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userId = res.locals.userId;
        const news: INews[] | [] = await newsService.newsByUserService(userId);
        if (news.length === 0) {
            return res.status(204).send();
        }

        return res.send(news);
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const upDate = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { title, text, banner } = req.body;
        const news: INews = res.locals.news;

        if (!title && !text && !banner) {
            return res.status(400).send({ message: "Submit at least one fields to update the post" });
        }

        if (String(news.user._id) !== String(res.locals.userId)) {
            return res.status(403).send({ message: "You didn't update this post" });
        }

        await newsService.upDateService(news._id, title, text, banner);
        return res.status(200).send({ message: "Post successfully updated" });

    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const erase = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const news: INews = res.locals.news;
        if (String(news.user._id) !== String(res.locals.userId)) {
            return res.status(403).send({ message: "You didn't delete this post" });
        }

        await newsService.eraseNewsService(news._id);
        return res.status(200).send({ message: "Post deleted successfully" });

    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const likeNews = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const news: INews = res.locals.news;
        const userId: Types.ObjectId = res.locals.userId;

        if (!news.dataLikeId) {
            await newsService.createNewsDataLikeService(news._id, userId);
            return res.status(201).send({ message: "Like done successfully" });
        }

        const isLiked = await newsService.isUserInLikeNewsArray(news.dataLikeId, userId);
        if (!isLiked) {
            await newsService.likeNewsService(news.dataLikeId, userId);
            return res.status(200).send({ message: "Like done successfully" });
        } else {
            await newsService.deleteLikeNewsService(news.dataLikeId, userId);''
            return res.status(200).status(200).send({ message: "Like successfully removed" });
        }
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const getPaginatedLikes = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const news: INews = res.locals.news;
        let limit = req.query.limit ? Number(req.query.limit) : 5;
        let offset = req.query.offset ? Number(req.query.offset) : 0;

        const total: number = news.likeCount;
        const currentUrl = req.baseUrl;
        const likes: ILikeNews[] = await newsService.likesPipelineService(news.dataLikeId, offset, limit);
        if (likes.length === 0) return res.status(400).send({ message: "There are no registered likes" });

        const next = offset + limit;
        const nextUrl = next < total ? `${currentUrl}/likePage/${news._id}?limit=${limit}&offset=${next}` : null;

        const previous = offset - limit < 0 ? null : offset - limit;
        const previousUrl = previous != null ? `${currentUrl}/likePage/${news._id}?limit=${limit}&offset=${previous}` : null;

        res.send({
            nextUrl,
            previousUrl,
            limit,
            offset,
            total,
            likes
        });
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const addComment = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const news: INews = res.locals.news;
        const userId: Types.ObjectId = res.locals.userId;
        const { content } = req.body;

        if (!content) return res.status(400).send({ message: "Write a message to comment" });

        if (!news.dataCommentId) {
            await newsService.createCommentDataService(news._id, userId, content);
            return res.status(201).send({ message: "Comment successfully completed" });
        } else {
            await newsService.upDateCommentDataService(news.dataCommentId, userId, content);
            res.status(200).send({ message: "Comment successfully completed" });
        }
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const deleteComment = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dataCommentId = new Types.ObjectId(req.params.dataCommentId);
        const commentId = new Types.ObjectId(req.params.commentId);

        const comment: ICommentNews = res.locals.comment;
        const userId = res.locals.userId;

        if (String(comment.comment[0].userId) !== String(userId)) return res.status(403).send({ message: "You can't delete this comment" });

        await newsService.deleteCommentService(dataCommentId, commentId)
        res.status(200).send({ message: "Comment successfully removed" });

    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const getPaginatedComments = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const news: INews = res.locals.news;
        let limit = req.query.limit ? Number(req.query.limit) : 10;
        let offset = req.query.offset ? Number(req.query.offset) : 0;

        const total: number = news.commentCount;
        const currentUrl = req.baseUrl;
        const comments: ICommentNews[] = await newsService.commentsPipelineService(news.dataCommentId, offset, limit);
        if (comments.length === 0) return res.status(404).send({ message: "There are no registered comments" });

        const next = offset + limit;
        const nextUrl = next < total ? `${currentUrl}/commentPage/${news._id}?limit=${limit}&offset=${next}` : null;

        const previous = offset - limit < 0 ? null : offset - limit;
        const previousUrl = previous != null ? `${currentUrl}/commentPage/${news._id}?limit=${limit}&offset=${previous}` : null;

        res.send({
            nextUrl,
            previousUrl,
            limit,
            offset,
            total,
            comments
        });
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const likeComment = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dataCommentId = new Types.ObjectId(req.params.dataCommentId);
        const commentId = new Types.ObjectId(req.params.commentId);
        const userId: Types.ObjectId = res.locals.userId;
        const comment: ICommentNews = res.locals.comment;

        const commentDataLikeId = comment.comment[0].dataLikeId;
        if (!commentDataLikeId) {
            await newsService.createLikeCommentDataService(dataCommentId, commentId, userId);
            return res.status(201).send({ message: "Like done successfully" });
        }

        const isLiked = await newsService.isUserInLikeCommentArray(commentDataLikeId, userId);
        if (!isLiked) {
            await newsService.likeCommentService(commentDataLikeId, userId);
            return res.status(200).send({ message: "Like done successfully" });
        } else {
            await newsService.deleteLikeCommentService(commentDataLikeId, userId);
            return res.status(200).send({ message: "Like successfully removed" });

        }
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const addReplyComment = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dataCommentId = new Types.ObjectId(req.params.dataCommentId);
        const commentId = new Types.ObjectId(req.params.commentId);
        const comment: ICommentNews = res.locals.comment;
        const userId: Types.ObjectId = res.locals.userId;
        const { content } = req.body;
        if (!content) return res.status(400).send({ message: "Write a message to reply" });

        const commentDataReplyId = comment.comment[0].dataReplyId;
        if (!commentDataReplyId) {
            await newsService.createReplyCommentDataService(dataCommentId, commentId, userId, content);
            return res.status(201).send({ message: "Reply successfully completed" });
        } else {
            await newsService.upDateReplyCommentDataService(commentDataReplyId, userId, content);
            return res.status(200).send({ message: "Reply successfully completed" });
        }
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const deleteReply = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dataReplyId = new Types.ObjectId(req.params.dataReplyId);
        const replyId = new Types.ObjectId(req.params.replyId);
        const userId = res.locals.userId;
        const reply: IReplyComment = res.locals.reply;

        if (String(reply.reply[0].userId) !== String(userId)) return res.status(403).send({ message: "You can't delete this reply" });
        await newsService.deleteReplyCommentService(dataReplyId, replyId);
        res.status(200).send({ message: "Reply successfully removed" });

    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const getPaginatedReply = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dataCommentId = new Types.ObjectId(req.params.dataCommentId);
        const commentId = new Types.ObjectId(req.params.commentId);
        let limit = req.query.limit ? Number(req.query.limit) : 10;
        let offset = req.query.offset ? Number(req.query.offset) : 0;

        const comment: ICommentNews = res.locals.comment;
        const dataReplyId = comment.comment[0].dataReplyId;

        const total: number = comment.comment[0].replyCount;
        const currentUrl = req.baseUrl;
        const replies: IReplyComment[] = await newsService.replyCommentsPipelineService(dataReplyId, offset, limit);
        if (replies.length === 0) return res.status(400).send({ message: "There are no registered replies" });

        const next = offset + limit;
        const nextUrl = next < total ? `${currentUrl}/replyPage/${dataCommentId}/${commentId}?limit=${limit}&offset=${next}` : null;

        const previous = offset - limit < 0 ? null : offset - limit;
        const previousUrl = previous != null ? `${currentUrl}/replyPage/${dataCommentId}/${commentId}?limit=${limit}&offset=${previous}` : null;

        res.send({
            nextUrl,
            previousUrl,
            limit,
            offset,
            total,
            replies
        });
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

const likeReply = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dataReplyId = new Types.ObjectId(req.params.dataReplyId);
        const replyId = new Types.ObjectId(req.params.replyId);
        const userId: Types.ObjectId = res.locals.userId;

        const reply: IReplyComment = res.locals.reply;
        const replyDataLikeId = reply.reply[0].dataLike;
        if (!replyDataLikeId) {
            await newsService.createLikeReplyDataService(dataReplyId, replyId, userId);
            return res.status(201).send({ message: "Like done successfully" });
        }

        const isLiked = await newsService.isUserInLikeReplyArray(replyDataLikeId, userId);
        if (!isLiked) {
            await newsService.likeReplyService(replyDataLikeId, userId);
            return res.status(200).send({ message: "Like done successfully" });
        } else {
            await newsService.deleteLikeReplyService(replyDataLikeId, userId);
            return res.status(200).send({ message: "Like successfully removed" });

        }
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

export default {
    create,
    findAll,
    topNews,
    findById,
    searchByTitle,
    newsByUser,
    upDate,
    erase,
    likeNews,
    addComment,
    deleteComment,
    addReplyComment,
    deleteReply,
    likeComment,
    getPaginatedComments,
    getPaginatedLikes,
    getPaginatedReply,
    likeReply
};