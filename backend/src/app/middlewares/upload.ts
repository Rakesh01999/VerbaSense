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
    const allowedExtensions = ['.wav', '.mp3', '.m4a', '.ogg', '.flac', '.webm'];
    
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error(`Only audio files (${allowedExtensions.join(', ')}) are allowed`));
    }
    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter
});

const profilePhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.webp') {
        return cb(new Error('Only images (.jpg, .jpeg, .png, .webp) are allowed'));
    }
    cb(null, true);
};

export const uploadProfilePhoto = multer({
    storage: profilePhotoStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
