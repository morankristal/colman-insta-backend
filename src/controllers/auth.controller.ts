import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { IUser } from "../models/user.model";
import { Document } from 'mongoose';

type tTokens = {
    accessToken: string,
    refreshToken: string
}

const generateToken = (userId: string): tTokens | null => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const random = Math.random().toString();
    const accessToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRES });

    const refreshToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};

const register = async (req: Request, res: Response) => {
    try {
        const password = req.body.password;
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: password,
            profilePicture: req.body.profilePicture
        });
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            res.status(400).send('wrong username or password');
            return;
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) {
            res.status(400).send('wrong username or password');
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server Error');
            return;
        }

        const tokens = generateToken(user._id);
        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }

        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();

        // שליחת ה-JWT כ-Cookie
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: false, // כדי למנוע גישה מ-JavaScript
            secure: false,
            sameSite: 'lax', // שים לב לשנות ל-lax
            maxAge: 60 * 60 * 1000 // תוקף של שעה
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax', // שים לב לשנות ל-lax
            maxAge: 7 * 24 * 60 * 60 * 1000 // תוקף של שבוע
        });

        res.status(200).send({
            _id: user._id,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            message: 'Login successful',
        });
    } catch (err) {
        res.status(400).send(err);
    }
};

// const login = async (req: Request, res: Response) => {
//     try {
//         const user = await User.findOne({ username: req.body.username });
//         if (!user) {
//             res.status(400).send('wrong username or password');
//             return;
//         }
//
//         const validPassword = await bcrypt.compare(req.body.password, user.password);
//
//         if (!validPassword) {
//             res.status(400).send('wrong username or password');
//             return;
//         }
//         if (!process.env.TOKEN_SECRET) {
//             res.status(500).send('Server Error');
//             return;
//         }
//         const tokens = generateToken(user._id);
//         if (!tokens) {
//             res.status(500).send('Server Error');
//             return;
//         }
//         if (!user.refreshToken) {
//             user.refreshToken = [];
//         }
//         user.refreshToken.push(tokens.refreshToken);
//         await user.save();
//         res.status(200).send(
//             {
//                 accessToken: tokens.accessToken,
//                 refreshToken: tokens.refreshToken,
//                 _id: user._id
//             });
//
//     } catch (err) {
//         res.status(400).send(err);
//     }
// };

type tUser = Document<unknown, {}, IUser> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}
const verifyRefreshToken = (refreshToken: string | undefined) => {
    return new Promise<tUser>((resolve, reject) => {
        if (!refreshToken) {
            reject("no refresh token in verify refresh token");
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            reject("no token secret in verify refresh token");
            return;
        }
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
            if (err) {
                reject("faield to verify in verify refresh token");
                return
            }
           
            const userId = payload._id;
            try {
                
                const user = await User.findById(userId);
                if (!user) {
                    reject("cannot find user in verify refresh token");
                    return;
                }
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken = [];
                    await user.save();
                    reject("fail save user in verify refresh token");
                    return;
                }
                const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
                user.refreshToken = tokens;

                resolve(user);
            } catch (err) {
                reject("fail in verify refresh token");
                return;
            }
        });
    });
};

// const refresh = async (req: Request, res: Response) => {
//     try {
//         const user = await verifyRefreshToken(req.body.refreshToken);
//         if (!user) {
//             res.status(400).send("fail to verify refresh token in refresh");
//             return;
//         }
//         const tokens = generateToken(user._id);
//         if (!tokens) {
//             res.status(500).send('Server Error');
//             return;
//         }
//         if (!user.refreshToken) {
//             user.refreshToken = [];
//         }
//         user.refreshToken.push(tokens.refreshToken);
//         await user.save();
//         res.status(200).send(
//             {
//                 accessToken: tokens.accessToken,
//                 refreshToken: tokens.refreshToken,
//                 _id: user._id
//             });
//
//     } catch (err) {
//         console.log(err)
//         res.status(400).send("fail in refresh");
//     }
// };
const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies['refreshToken']
        const user = await verifyRefreshToken(refreshToken);
        if (!user) {
            res.status(400).send("fail to verify refresh token in refresh");
            return;
        }

        const tokens = generateToken(user._id);
        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }

        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();

        // עדכון הקוקיז עם הטוקנים החדשים
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // שעה
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // שבוע
        });

        res.status(200).send({
            _id: user._id,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            message: 'Tokens refreshed successfully',
        });

    } catch (err) {
        console.log(err);
        res.status(400).send("fail in refresh");
    }
};

// const logout = async (req: Request, res: Response) => {
//     try {
//         const user = await verifyRefreshToken(req.body.refreshToken);
//         await user.save();
//         res.status(200).send("success");
//     } catch (err) {
//         res.status(400).send("fail");
//     }
// };

const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies['refreshToken']
        const user = await verifyRefreshToken(refreshToken);

        // ניקוי רשימת ה-Refresh Tokens אצל המשתמש
        user.refreshToken = [];
        await user.save();

        // מחיקת הקוקיז
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(200).send("success");
    } catch (err) {
        res.status(400).send("fail");
    }
};


export default {
    register,
    login,
    refresh,
    logout
};