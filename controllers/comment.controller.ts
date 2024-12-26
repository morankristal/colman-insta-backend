import Comment from "../models/comment.model";
import { IComment } from "../models/comment.model";
import BaseController from "./baseController";

const commentController = new BaseController<IComment>(Comment);

export default commentController;



