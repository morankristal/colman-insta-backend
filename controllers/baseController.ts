import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
    model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async getAll(req: Request, res: Response) {
        const filter = req.query.owner; // Assuming a filter is possible (adjust as needed)
        try {
            const items = filter ? await this.model.find({ owner: filter }) : await this.model.find();
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
        const body = req.body;
        try {
            const item = await this.model.create(body);
            console.log(item)
            res.status(201).send(item);
        } catch (error) {
            console.log(req.body)
            res.status(400).send(error);
        }
    }

    async update(req: Request, res: Response) {
        const id = req.params.id;
        const updateData = req.body;
        try {
            const item = await this.model.findByIdAndUpdate(id, updateData, { new: true });
            if (item) {
                res.status(200).send(item);
            } else {
                res.status(404).send("Not found");
            }
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async delete(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const item = await this.model.findByIdAndDelete(id);
            if (item) {
                res.status(200).send({ message: "Item deleted successfully" });
            } else {
                res.status(404).send("Not found");
            }
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default BaseController;
