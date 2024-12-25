import Post from "../models/post.model";
import { IPost } from "../models/post.model";
import BaseController from "./baseController";

const postController = new BaseController<IPost>(Post);

export default postController;



