import multer from "multer";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

export class UploadMiddleware {
  private static readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  static pdf() {
    const upload = multer({
      storage,
      limits: { fileSize: UploadMiddleware.MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype === "application/pdf") {
          cb(null, true);
        } else {
          cb(new Error("Only PDF files are allowed"));
        }
      },
    });

    return (req: Request, res: Response, next: NextFunction): void => {
      upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            next(new Error("File size exceeds the 20MB limit"));
            return;
          }
          next(new Error(err.message));
          return;
        }
        if (err) {
          next(err);
          return;
        }
        next();
      });
    };
  }
}
