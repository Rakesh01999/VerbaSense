const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin';
const dest = path.join(__dirname, 'backend/bin/ggml-medium.bin');

console.log(`Downloading ${url} to ${dest}...`);
console.log(`This is a large file (~1.5GB) and might take several minutes depending on your internet connection.`);

const file = fs.createWriteStream(dest);
https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
            const totalSize = parseInt(res.headers['content-length'], 10);
            let downloaded = 0;
            
            res.on('data', (chunk) => {
                downloaded += chunk.length;
                const percent = ((downloaded / totalSize) * 100).toFixed(2);
                process.stdout.write(`\rProgress: ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)} MB / ${(totalSize / 1024 / 1024).toFixed(1)} MB)`);
            });

            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('\nDownload complete.');
            });
        });
    } else {
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloaded = 0;
        
        response.on('data', (chunk) => {
            downloaded += chunk.length;
            const percent = ((downloaded / totalSize) * 100).toFixed(2);
            process.stdout.write(`\rProgress: ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)} MB / ${(totalSize / 1024 / 1024).toFixed(1)} MB)`);
        });

        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('\nDownload complete.');
        });
    }
}).on('error', (err) => {
    fs.unlink(dest);
    console.error(`\nError: ${err.message}`);
});
