import { Router } from "express";
const route = Router();

import newsController from "../controllers/news.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";


route.post("/", authMiddleware, newsController.create);
route.get("/", newsController.findAll);
route.get("/top", newsController.topNews);
route.get("/id/:newsId", authMiddleware, newsController.findById);
route.get("/search", newsController.searchByTitle);
route.get("/newsByUser", authMiddleware, newsController.newsByUser);
route.patch("/:newsId", authMiddleware, newsController.upDate);
route.delete("/:newsId", authMiddleware, newsController.erase);
route.post("/likeNews/:newsId", authMiddleware, newsController.likeNews);
route.delete("/comment/:newsId/:commentId", authMiddleware, newsController.deleteComment);
route.get("/commentPage/:newsId", newsController.getPaginatedComments);
route.patch("/likeComment/:commentId", authMiddleware, newsController.likeComment);
route.patch("/reply/:id/:idComment", authMiddleware, newsController.addReplyToComment);
route.patch("/reply/:id/:idComment/:idReply", authMiddleware, newsController.deleteReply);

//for development only
route.post("/comment/:newsId", authMiddleware, newsController.addComment);
route.get("/comment/:newsId", newsController.findAllCommentByNewsId);


export default route;

//TODO: add middleware for comment and news validation