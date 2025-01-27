import { Request, Response } from "express";
import axios from "axios";
const { GoogleGenerativeAI } = require("@google/generative-ai");

class AskController {
    async askQuestion(req: Request, res: Response) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = req.body.prompt;
            const result = await model.generateContent(prompt);
            console.log(result.response.text());
            res.status(200).send(result.response.text());
        } catch (error) {
            console.error(error);
            res.status(500).send("Error generating AI content");
        }
    }
}

export default new AskController();