"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const transcribe_1 = __importDefault(require("./routes/transcribe"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/transcribe', transcribe_1.default);
app.get('/', (req, res) => {
    res.send('VerbaSense API is running...');
});
// Database connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
    console.warn('WARNING: MongoDB URI is not fully configured. Please update .env with your credentials.');
}
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Successfully connected to MongoDB Atlas.');
    if (process.env.NODE_ENV !== 'test') {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
exports.default = app;
