import multer from 'multer';
import path from 'path';
import { v4 as uuidv4} from 'uuid'


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm'];
    if (allowedTypes.includes(file.mimetype)){
        cb(null, true)
    } else {
        cb(new Error('Invalid file type'), false)
    }
}

export default multer ({
    storage, fileFilter, limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    }
})


