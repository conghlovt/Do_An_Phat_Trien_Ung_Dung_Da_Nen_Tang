import multer from 'multer';
import { BadRequestError } from '../../shared/errors/AppError';

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
const DOC_MIMES = ['application/pdf'];
const ALL_ALLOWED_MIMES = [...IMAGE_MIMES, ...VIDEO_MIMES, ...DOC_MIMES];

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALL_ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(
      `Loại file không được hỗ trợ: ${file.mimetype}. Cho phép: jpg, png, webp, gif, mp4, webm, pdf`,
      'FILE_TYPE_NOT_ALLOWED'
    ));
  }
};

export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single('file');

export const uploadMultipleImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter,
}).array('files', 10);

export const uploadSingleVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
}).single('file');

export const uploadGenericFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
}).single('file');

export const uploadMultipleFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter,
}).array('files', 10);
