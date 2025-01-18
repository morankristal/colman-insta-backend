import multer from 'multer';
import path from 'path';


// הגדרת התיקייה שאליה יישמרו הקבצים
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'images')); // תיקיית היעד
    },
    filename: (req, file, cb) => {
        // שמירת הקובץ עם שם ייחודי
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

// סינון סוגי קבצים מותרים
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

// יצירת האובייקט Multer
const upload = multer({ storage, fileFilter });

export default upload;
