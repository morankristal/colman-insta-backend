import User from "../models/user.model";
import { IUser } from "../models/user.model";  // Assuming the IUser interface exists
import BaseController from "./baseController";

// Creating an instance of BaseController with the User model
const userController = new BaseController<IUser>(User);

export default userController;
