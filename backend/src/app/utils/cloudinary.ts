import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (
    localFilePath: string, 
    folder: string,
    resourceType: 'image' | 'video' | 'auto' | 'raw' = 'auto'
): Promise<string | null> => {
    try {
        if (!fs.existsSync(localFilePath)) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
            folder: `verbasense/${folder}`
        });

        return response.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return null;
    } finally {
        // Always attempt to delete the temporary file after uploading to cloud
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (cleanupError) {
            console.error('Failed to clean up local file:', cleanupError);
        }
    }
};

export const deleteFromCloudinary = async (
    cloudinaryUrl: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> => {
    try {
        if (!cloudinaryUrl.includes('res.cloudinary.com')) return;
        
        const urlParts = cloudinaryUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) return;
        
        const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = publicIdWithExt.split('.')[0];

        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Cloudinary delete error:', error);
    }
};
