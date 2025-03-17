# AI Therapy Chat Application

A full-stack application combining a Next.js frontend with a Python backend powered by Ollama's LLM for providing therapeutic conversations.

## Prerequisites

### 1. Install Node.js
- Download and install Node.js from [https://nodejs.org/](https://nodejs.org/)
- Recommended version: Node.js 18.x or later
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Install Python
- Download and install Python from [https://www.python.org/downloads/](https://www.python.org/downloads/)
- Recommended version: Python 3.8 or later
- Make sure to check "Add Python to PATH" during installation
- Verify installation:
  ```bash
  python --version
  pip --version
  ```

### 3. Install and Configure Ollama
1. Download Ollama from [https://ollama.ai/download](https://ollama.ai/download)
2. Run the installer
3. After installation, Ollama service should start automatically
   - On Windows: Ollama runs as a background service
   - On macOS/Linux: You may need to start it manually with `ollama serve`
4. Verify Ollama is running:
   ```bash
   ollama list
   ```
5. Pull the required model:
   ```bash
   ollama pull llama3.1:8b
   ```
   Note: This will download approximately 4.9GB of data.

## Project Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MentalHealth
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Python Dependencies
```bash
# Create and activate a virtual environment (recommended)
python -m venv venv
# On Windows:
.venv\Scripts\activate
# On Unix or MacOS:
source venv/bin/activate

# Install required packages
pip install streamlit fastapi uvicorn pydantic ollama numpy
```

## Running the Application

### 1. Ensure Ollama is Running
Before starting the application, verify Ollama is running:
```bash
ollama list
```
If you see your models listed, Ollama is running correctly.

If Ollama is not running:
- On Windows: Check if Ollama is running in the system tray or restart your computer
- On macOS/Linux: Start Ollama with:
  ```bash
  ollama serve
  ```

### 2. Start the Python Backend
Open a new terminal and run:
```bash
# Make sure you're in the project directory
cd MentalHealth

# Activate the virtual environment if not already activated
# On Windows:
venv\Scripts\activate
# On Unix or MacOS:
source venv/bin/activate

# Start the FastAPI server
python app.py --mode api
```
You should see output indicating the server is running on port 8501.

### 3. Start the Frontend
Open another terminal and run:
```bash
# Make sure you're in the project directory
cd MentalHealth

# Start the Next.js development server
npm run dev
```
The frontend should be available at http://localhost:3000 (or http://localhost:3001 if port 3000 is in use).

## Usage

1. Open your web browser and navigate to http://localhost:3000 (or http://localhost:3001)
2. Start chatting with the AI therapist
3. The application supports:
   - Text-based conversations
   - Audio responses (if Piper TTS is configured)
   - Dark/light mode toggle
   - Responsive design

## Data Persistence

### Chat History
- Chat conversations are automatically saved in the `chat_history` directory
- Each user's conversation is stored in a separate pickle file (e.g., `default_history.pkl`)
- Conversations persist between sessions
- The history includes:
  - Message content
  - Timestamps
  - Role (user/assistant)
  - Conversation context

### Audio Files
- Generated audio responses are saved in the `output` directory
- Audio files are named with timestamps (e.g., `output_1234567890.wav`)
- Old audio files are not automatically cleaned up

### Data Location
- Chat history: `./chat_history/`
- Audio files: `./output/`
- Model files: `~/.ollama/models/` (Ollama's default location)

## Troubleshooting

### Common Issues

1. **Ollama Connection Issues**
   - Make sure Ollama is running (you should see it in your system tray on Windows)
   - On macOS/Linux, run `ollama serve` in a separate terminal
   - Verify the model is pulled: `ollama list`
   - Check if port 11434 is available
   - If you get "connection refused" errors, ensure Ollama is running

2. **Port Conflicts**
   - If port 3000 is in use, the frontend will automatically use port 3001
   - If port 8501 is in use, you can modify the port in `app.py`

3. **Python Dependencies**
   - If you get module not found errors, make sure you've activated the virtual environment
   - Verify all dependencies are installed: `pip list`

4. **Node.js Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: 
     ```bash
     rm -rf node_modules
     npm install
     ```

5. **Data Storage Issues**
   - Ensure you have write permissions in the project directory
   - Check available disk space
   - If chat history is corrupted, you can safely delete the pickle files in `chat_history/`

## System Requirements

- RAM: Minimum 8GB (16GB recommended)
- Storage: At least 10GB free space
- Operating System: Windows 10/11, macOS, or Linux
- Internet connection for initial setup and model download

## Notes

- The application uses the llama3.1:8b model, which requires approximately 4.9GB of storage
- Audio features require the Piper TTS system (optional)
- All conversations are processed locally on your machine
- The application is designed for development/testing purposes and should not be used for actual therapy
- Ollama service must be running for the application to work
- On Windows, Ollama runs as a background service and starts automatically
- On macOS/Linux, you may need to start Ollama manually with `ollama serve`
- Chat history is automatically saved and persists between sessions
- Consider periodically cleaning up the `output` directory to manage disk space
