"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeAudio = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const WHISPER_PATH = process.env.WHISPER_PATH || path_1.default.join(__dirname, '../../bin/main.exe');
const MODEL_PATH = process.env.MODEL_PATH || path_1.default.join(__dirname, '../../bin/ggml-base.en.bin');
const transcribeAudio = (audioPath) => {
    return new Promise((resolve, reject) => {
        if (!fs_1.default.existsSync(WHISPER_PATH)) {
            console.warn(`Whisper binary not found at ${WHISPER_PATH}. Using mock transcription.`);
            return setTimeout(() => resolve("This is a mock transcription because the whisper.cpp binary was not found. Please build whisper.cpp and place the executable in the bin folder."), 2000);
        }
        const command = `"${WHISPER_PATH}" -m "${MODEL_PATH}" -f "${audioPath}" -nt`;
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Whisper execution error: ${error}`);
                return reject(error);
            }
            resolve(stdout.trim());
        });
    });
};
exports.transcribeAudio = transcribeAudio;
