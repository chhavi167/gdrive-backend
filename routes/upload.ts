import { Request, Response } from "express";
import { uploadToS3 } from "./s3";
import prisma from "../db/db.config";
import multer from "multer";


//multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });
export default upload;


// POST /upload
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const userId = (req as any).user.userId;
    
    const url = await uploadToS3(file);

    const newFile = await prisma.file.create({
      data: {
        name: file.originalname,
        url,
        ownerId: userId,
      },
    });

    res.status(200).json(newFile);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// GET /my-files
export const getMyFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const files = await prisma.file.findMany({
      where: { ownerId: userId },
      // include: { accessList: true },
    });

    res.status(200).json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
