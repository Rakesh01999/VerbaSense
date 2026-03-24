FROM node:20-bookworm

# Install dependencies including build-essential for whisper.cpp and ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    cmake \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Build whisper.cpp (CLI) and Download Model
# We build ONLY whisper-cli using CMake to save memory and time
RUN git clone https://github.com/ggerganov/whisper.cpp.git /tmp/whisper.cpp \
    && cd /tmp/whisper.cpp \
    && cmake -B build -DBUILD_SHARED_LIBS=OFF \
    && cmake --build build --config Release --target whisper-cli -j1 \
    && mkdir -p /app/bin \
    && cp /tmp/whisper.cpp/build/bin/whisper-cli /app/bin/whisper-cli \
    && wget -O /app/bin/ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin \
    && rm -rf /tmp/whisper.cpp

# 2. Copy package files and install
COPY package*.json ./
RUN npm install

# 3. Copy source and build TS
COPY . .
RUN npm install -g typescript@5.4.5
RUN npm run build

# 4. Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV WHISPER_PATH=/app/bin/whisper-cli

CMD ["npm", "start"]
