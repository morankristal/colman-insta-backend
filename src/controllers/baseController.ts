import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
    model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async getAll(req: Request, res: Response) {
        try {
            const items = await this.model.find();
            res.status(200).send(items);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getById(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const item = await this.model.findById(id);
            if (item) {
                res.status(200).send(item);
            } else {
                res.status(404).send("Not found");
            }
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async create(req: Request, res: Response) {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized: User ID is missing" });
        }
        const body = { ...req.body, sender: userId };
        try {
            const item = await this.model.create(body);
            res.status(201).send(item);
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).send({ error: "Duplicate key error: Field must be unique" });
            }
            res.status(400).send({ error: error.message });
        }
    }


    async update(req: Request, res: Response) {
        const id = req.params.id;
        const updateData = req.body;
        
        try {
            const item = await this.model.findById(id);
            if (!item) {
                return res.status(404).send("Not found");
            }
            const updatedItem = await this.model.findByIdAndUpdate(id, updateData, { new: true });
            res.status(200).send(updatedItem);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        const id = req.params.id;

        try {
            const item = await this.model.findById(id);
            if (!item) {
                return res.status(404).send("Not found");
            }

            await this.model.findByIdAndDelete(id);
            return res.status(200).send({ message: "Item deleted successfully" });
        } catch (error) {
            return res.status(400).send(error);
        }
    }
}

export default BaseController;
