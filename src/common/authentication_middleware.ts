import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';


type Payload = {
    _id: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['accessToken'] as string|| req.header('Authorization')?.split(' ')[1]; // מקבלים את ה-token גם אם הוא בכותרת
    if (!token) {
        res.status(401).send('Access Denied');
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send('Server Error');
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(401).send('Access Denied');
            return;
        }
        req.params.userId = (payload as Payload)._id;
        next();
    })
};

export default authMiddleware;
