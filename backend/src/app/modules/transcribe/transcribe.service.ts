import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

// Set ffmpeg path
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

const WHISPER_PATH = process.env.WHISPER_PATH || path.join(__dirname, '../../../../bin/whisper-cli.exe');
const MODEL_PATH_EN = process.env.MODEL_PATH_EN || path.join(__dirname, '../../../../bin/ggml-base.en.bin');
const MODEL_PATH_MULTI = process.env.MODEL_PATH_MULTI || path.join(__dirname, '../../../../bin/ggml-medium.bin');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../../uploads');
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

export const transcribeAudio = async (audioPath: string, language: string = 'en'): Promise<string> => {
    let convertedPath: string | null = null;
    
    try {
        if (!fs.existsSync(WHISPER_PATH)) {
            console.warn(`[Whisper] Binary not found at ${WHISPER_PATH}`);
            return "Error: Whisper binary not found. Please ensure all DLLs are extracted and main.exe is in backend/bin.";
        }

        // Use multilingual model for Bengali or any other non-English language
        const modelPath = language === 'en' ? MODEL_PATH_EN : MODEL_PATH_MULTI;

        if (!fs.existsSync(modelPath)) {
            console.warn(`[Whisper] Model not found at ${modelPath}`);
            const modelName = path.basename(modelPath);
            return `Error: Whisper model not found. Please place ${modelName} in backend/bin.`;
        }

        // 1. Convert to required format
        convertedPath = await convertToWhisperFormat(audioPath);
        const absoluteAudioPath = path.resolve(convertedPath);

        // 2. Prepare command
        const binDir = path.dirname(WHISPER_PATH);
        const relativeModelPath = path.relative(binDir, modelPath);
        const relativeAudioPath = path.relative(binDir, absoluteAudioPath);
        
        // Use a unique output filename to avoid collisions
        // Prepare command string
        const languageFlag = language !== 'en' ? `-l ${language}` : '';
        
        // Simple command without prompts or complex shells to avoid mangling
        const command = `whisper-cli.exe -m "${relativeModelPath}" -f "${relativeAudioPath}" ${languageFlag} -nt -np`;

        console.log(`[Whisper] Executing: ${command}`);

        // 3. Execute transcription using simple exec
        const transcribedText = await new Promise<string>((resolve, reject) => {
            exec(command, { cwd: binDir }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`[Whisper] Execution Error: ${error.message}`);
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
        return transcribedText;

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
