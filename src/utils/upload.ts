import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import multer from "multer"
import sharp from "sharp"

// Configure multer
const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Initialize S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

// Get S3 URL
const getS3Url = (key: string): string => {
    return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET}/${key}`;
};

// Resize image utility
export const resizeImage = async (buffer: Buffer, maxWidth: number, maxHeight: number) => {
    return sharp(buffer)
        .resize(maxWidth, maxHeight, {
            fit: sharp.fit.inside,
            withoutEnlargement: true
        })
        .toBuffer();
};

// Upload image to S3
export const uploadImage = async (
    folderPath: string,
    fileName: string,
    file: Express.Multer.File,
    resize: boolean = false
) => {
    try {
        const updatedBuffer = resize ?
            await resizeImage(file.buffer, 800, 800) :
            file.buffer;

        const fileExtension = file.originalname.split(".").pop();
        const key = `rentify/${folderPath}${folderPath.length ? '/' : ''}${fileName}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: updatedBuffer,
            ContentType: file.mimetype
        });

        await s3.send(command);
        return {
            key,
            url: getS3Url(key)
        };
    } catch (error) {
        console.error('Upload failed:', error);
        throw new Error('Failed to upload image');
    }
};

// Upload image from buffer
export const uploadImageFromBuffer = async (
    folderPath: string,
    fileName: string,
    file: Express.Multer.File,
    buffer: Buffer
) => {
    try {
        const key = `rentify/${folderPath}/${fileName}`;
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.mimetype
        });

        await s3.send(command);
        return {
            key,
            url: getS3Url(key)
        };
    } catch (error) {
        console.error('Upload from buffer failed:', error);
        throw new Error('Failed to upload image from buffer');
    }
};

// Delete image from S3
export const deleteImage = async (key: string) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        });

        await s3.send(command);
        return key;
    } catch (error) {
        console.error('Delete failed:', error);
        throw new Error('Failed to delete image');
    }
};