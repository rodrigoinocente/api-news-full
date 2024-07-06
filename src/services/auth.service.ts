import { Types } from "mongoose";
import { IUser } from "../../custom";
import { UserModel } from "../database/db";
import jwt from "jsonwebtoken";

const loginService = (email: string): Promise<IUser> => UserModel.findOne({ email: email }).select("+password");

const generateToken = (id: Types.ObjectId): string => jwt.sign({ id: id }, process.env.SECRET_JWT as any, { expiresIn: 86400 });

export default {
    loginService,
    generateToken
};