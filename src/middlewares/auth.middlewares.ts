import jwt from "jsonwebtoken";
import userService from "../services/user.service";
import { NextFunction, Request, Response } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;

        if (!authorization) return res.status(401);

        const parts = authorization.split(" ");
        if (parts.length !== 2) return res.status(401);

        const [schema, token] = parts;
        if (schema !== "Bearer") return res.status(401);

        jwt.verify(token, process.env.SECRET_JWT as string, async (error: any, decoded: any) => {
            if (error) return res.status(401).send({ message: "Token invalid" });

            const user = await userService.findByIdService(decoded.id);
            if (!user || !user._id) return res.status(401).send({ message: "User not found" });

            res.locals.userId = user._id;
            next();
        });
    } catch (err: any) {
        res.status(500).send({ message: err.message });
    };
};

export { authMiddleware };