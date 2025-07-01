import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { extension } from "mime-types";
import { randomUUID } from "crypto";

// S3 client setup
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Upload Function
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  if (!file) throw new Error("No file provided to upload");

  const ext = extension(file.mimetype) || "bin";
  const key = `${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
   
    
  });

  await s3.send(command);

  // S3 File URL
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
