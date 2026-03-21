import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

// Set ffmpeg path
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

const isWindows = process.platform === 'win32';
const WHISPER_PATH = process.env.WHISPER_PATH || path.join(process.cwd(), `bin/whisper-cli${isWindows ? '.exe' : ''}`);
const MODEL_PATH_EN = process.env.MODEL_PATH_EN || path.join(process.cwd(), 'bin/ggml-base.en.bin');
const MODEL_PATH_MULTI = process.env.MODEL_PATH_MULTI || path.join(process.cwd(), 'bin/ggml-medium.bin');

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Converts audio to 16kHz, mono, PCM 16-bit WAV as required by whisper.cpp
 */
const convertToWhisperFormat = (inputPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const outputPath = inputPath.replace(path.extname(inputPath), '-converted.wav');
        
        console.log(`[FFmpeg] Converting ${path.basename(inputPath)} to Whisper format...`);
        
        ffmpeg(inputPath)
            .outputOptions([
                '-ar 16000',
                '-ac 1',
                '-c:a pcm_s16le'
            ])
            .toFormat('wav')
            .on('end', () => {
                console.log(`[FFmpeg] Conversion complete: ${path.basename(outputPath)}`);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error(`[FFmpeg] Error during conversion: ${err.message}`);
                reject(err);
            })
            .save(outputPath);
    });
};

/**
 * Gets the duration of an audio file in seconds
 */
const getAudioDuration = (inputPath: string): Promise<number> => {
    return new Promise((resolve) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                console.error(`[FFprobe] Error getting duration: ${err.message}`);
                return resolve(0);
            }
            resolve(metadata.format.duration || 0);
        });
    });
};

export const transcribeAudio = async (audioPath: string, language: string = 'en'): Promise<{ text: string, duration: number }> => {
    let convertedPath: string | null = null;
    let duration = 0;
    
    try {
        // Get duration first
        duration = await getAudioDuration(audioPath);

        if (!fs.existsSync(WHISPER_PATH)) {
            console.warn(`[Whisper] Binary not found at ${WHISPER_PATH}`);
            return { text: "Error: Whisper binary not found.", duration };
        }

        // Use multilingual model for Bengali or any other non-English language
        const modelPath = language === 'en' ? MODEL_PATH_EN : MODEL_PATH_MULTI;

        if (!fs.existsSync(modelPath)) {
            console.warn(`[Whisper] Model not found at ${modelPath}`);
            const modelName = path.basename(modelPath);
            return { text: `Error: Whisper model not found. Please place ${modelName} in backend/bin.`, duration };
        }

        // 1. Convert to required format
        convertedPath = await convertToWhisperFormat(audioPath);
        const absoluteAudioPath = path.resolve(convertedPath);

        // 2. Prepare command using absolute paths
        // Use a unique output filename to avoid collisions
        const languageFlag = language !== 'en' ? `-l ${language}` : '';
        
        // Robust command using absolute paths
        const command = `"${WHISPER_PATH}" -m "${modelPath}" -f "${absoluteAudioPath}" ${languageFlag} -nt -np`;

        console.log(`[Whisper] Executing: ${command}`);
        // 3. Execute transcription using simple exec
        const transcribedText = await new Promise<string>((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {                    console.error(`[Whisper] Execution Error: ${error.message}`);
                    return reject(new Error(`Transcription failed: ${error.message}`));
                }
                
                if (stderr) {
                    console.log(`[Whisper] Info: ${stderr}`);
                }

                const trimmedContent = stdout.trim();
                console.log(`[Whisper] Result length: ${trimmedContent.length}`);
                console.log(`[Whisper] Result hex: ${Buffer.from(trimmedContent).toString('hex')}`);

                resolve(trimmedContent);
            });
        });

        console.log(`[Whisper] Transcription successful`);
        return { text: transcribedText, duration };

    } catch (err: any) {
        console.error(`[Transcribe Service] Error: ${err.message}`);
        throw err;
    } finally {
        // Cleanup converted file after transcription
        if (convertedPath && fs.existsSync(convertedPath)) {
            fs.unlink(convertedPath, (err) => {
                if (err) console.error(`[Cleanup] Error deleting temp file: ${err.message}`);
            });
        }
    }
};
