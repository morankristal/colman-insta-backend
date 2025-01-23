import User from "../models/user.model";
import { IUser } from "../models/user.model";  // Assuming the IUser interface exists
import BaseController from "./baseController";
import { Request, Response } from "express";


class userController extends BaseController<IUser> {
    constructor() {
        super(User);
    }

async getByUsername(req: Request, res: Response) {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username });

        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        res.status(400).send(error);
     }
    }
}

export default userController;
