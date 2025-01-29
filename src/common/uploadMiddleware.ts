import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const uploadDir = path.join(__dirname, 'images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const handleUploadErrors = (req: Request, res: Response, next: NextFunction): void => {
    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            res.status(400).json({ error: err.message });
            return;
        } else if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        next();
    });
};

export { upload as default, handleUploadErrors };