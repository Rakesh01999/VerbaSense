import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const WHISPER_PATH = process.env.WHISPER_PATH || path.join(__dirname, '../../bin/main.exe');
const MODEL_PATH = process.env.MODEL_PATH || path.join(__dirname, '../../bin/ggml-base.en.bin');

export const transcribeAudio = (audioPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(WHISPER_PATH)) {
            console.warn(`Whisper binary not found at ${WHISPER_PATH}. Using mock transcription.`);
            return setTimeout(() => resolve("This is a mock transcription because the whisper.cpp binary was not found. Please build whisper.cpp and place the executable in the bin folder."), 2000);
        }

        const command = `"${WHISPER_PATH}" -m "${MODEL_PATH}" -f "${audioPath}" -nt`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Whisper execution error: ${error}`);
                return reject(error);
            }
            resolve(stdout.trim());
        });
    });
};
