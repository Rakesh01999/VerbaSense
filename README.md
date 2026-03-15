# VerbaSense

VerbaSense is a premium, high-performance Speech-to-Text (STT) application that leverages the power of the Whisper transcription engine to provide accurate, local, and secure voice processing.

## 🚀 Key Features

- **Real-time Transcription**: High-accuracy voice-to-text conversion using Whisper.
- **Multi-language Support**: Optimized for English, Spanish, French, German, and automatic language detection.
- **Interactive Dashboard**: Modern user interface with recording status visualizations and history management.
- **Secure Processing**: JWT-based authentication ensures all data remains private.
- **Data Safety**: Custom confirmation dialogs prevent accidental deletion of transcription history.
- **History Management**: Comprehensive tools to view, copy, and manage past transcriptions.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Shadcn/ui

### Backend
- **Runtime**: Node.js with Express
- **Engine**: Whisper C++ CLI implementation
- **Audio Processing**: FFmpeg for automated format normalization
- **Database**: MongoDB

## 📂 Project Structure

- `/frontend`: The client-side application.
- `/backend`: The API server and transcription engine bridge.
- `/docs`: Project requirements and setup documentation.

## ⚙️ Quick Start

### Prerequisites
- Node.js (v18+)
- FFmpeg installed in system PATH
- Whisper binary and models (refer to `docs/whisper_setup_guide.md`)

### Installation

1. **Clone the repository**
2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env with your DB and Whisper paths
   npm start
   ```
3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📄 License

Internal Project - All Rights Reserved
