import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.wav' && ext !== '.mp3') {
        return cb(new Error('Only .wav and .mp3 files are allowed'));
    }
    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter
});
