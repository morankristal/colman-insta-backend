import User from "../models/user.model";
import { IUser } from "../models/user.model";  // Assuming the IUser interface exists
import BaseController from "./baseController";

const userController = new BaseController<IUser>(User);

export default userController;
