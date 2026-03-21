FROM node:20-bookworm

# Install dependencies including build-essential for whisper.cpp and ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Build whisper.cpp (CLI) and Download Model
# We use -j1 to limit memory usage (critical for Render Free tier 512MB)
RUN git clone https://github.com/ggerganov/whisper.cpp.git /tmp/whisper.cpp \
    && cd /tmp/whisper.cpp \
    && make main -j1 \
    && mkdir -p /app/bin \
    && cp /tmp/whisper.cpp/main /app/bin/whisper-cli \
    && wget -O /app/bin/ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin \
    && rm -rf /tmp/whisper.cpp

# 2. Copy package files and install
COPY package*.json ./
RUN npm install

# 3. Copy source and build TS
COPY . .
RUN npm run build

# 4. Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV WHISPER_PATH=/app/bin/whisper-cli

CMD ["npm", "start"]
