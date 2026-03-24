import { uploadToCloudinary } from './src/app/utils/cloudinary';
import fs from 'fs';

async function testUpload() {
    console.log("Testing Cloudinary Upload...");
    fs.writeFileSync('test_image.txt', 'This is a test file to verify cloudinary upload works.');
    try {
        const url = await uploadToCloudinary('test_image.txt', 'test', 'raw');
        if (url) {
            console.log("SUCCESS! Cloudinary URL:", url);
        } else {
            console.log("FAILED to return URL.");
        }
    } catch (err: any) {
        console.error("EXCEPTION:", err.message);
    }
}

testUpload();
