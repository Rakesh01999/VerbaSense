# Whisper.cpp Setup Guide (Windows)

To make the backend fully functional, you need to build `whisper.cpp` and place the executable in the `backend/bin` folder.

## Prerequisites
- [Git](https://git-scm.com/)
- [CMake](https://cmake.org/download/)
- [Visual Studio](https://visualstudio.microsoft.com/downloads/) (with C++ development workload)

## Step-by-Step Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ggml-org/whisper.cpp.git
   cd whisper.cpp
   ```

2. **Build the project:**
   ```bash
   mkdir build
   cd build
   cmake ..
   cmake --build . --config Release
   ```

3. **Move the executable:**
   Copy `whisper.cpp/build/bin/Release/main.exe` to `E:/Internship/VerbaSense/backend/bin/main.exe`.

4. **Download a model:**
   Download the `ggml-base.en.bin` model (or any other) and place it in `E:/Internship/VerbaSense/backend/bin/`.
   You can find models [here](https://huggingface.co/ggerganov/whisper.cpp/tree/main).

5. **Start the Backend:**
   ```bash
   cd backend
   npm run dev
   ```

The backend is configured to search for `main.exe` and `ggml-base.en.bin` in the `backend/bin` directory by default.
