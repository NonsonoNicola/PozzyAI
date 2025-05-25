# PozzyAI Chat

PozzyAI Chat is a privacy-focused web-based chat application that allows users to interact with the Mistral-7B language model (or any other model downloadable from Hugging Face) without requiring user authentication. The application features a modern dark theme, responsive UI, and supports code generation in various programming languages.

## Features
- **AI-Powered Chat**: Interact with the Mistral-7B-Instruct-v0.2 language model.
- **User-Friendly Interface**: A clean, responsive web interface for seamless conversations.
- **Privacy-Focused**: All messages are stored only in your browser's temporary memory and are permanently deleted when the tab is closed. No user data is stored on servers.
- **Code Block Formatting**: Supports displaying and copying code snippets within chat responses.
- **Real-time Typing Indicator**: Shows when PozzyAI is generating a response.
- **Character Counter**: Helps manage input length.

## Technologies Used
- **Backend**: Python (Flask, Flask-Cors, ctransformers, huggingface-hub)
- **Frontend**: HTML, CSS, JavaScript
- **AI Model**: Mistral-7B-Instruct-v0.2-GGUF (downloaded via Hugging Face Hub)

## Installation Steps

### Prerequisites
- Python 3.11 (or compatible version)

### Setup
1. **Download and install** Python 3.11 from the [official website](https://www.python.org/downloads/).
2. **Ensure that Python is added** to your system's PATH.
3. **Install required Python packages** using pip:
   ```bash
   pip install -r requirements.txt
   ```
   This will install Flask, Flask-Cors, ctransformers, and huggingface-hub.

### Model Download
The application automatically downloads the `mistral-7b-instruct-v0.2.Q4_K_M.gguf` model to the `models` directory on first run if it's not already present. Ensure you have an active internet connection for the initial model download.

## How to Run
1. **Double Click** `PozzyAI.bat` to launch the application.
   This script will start the Flask server, which will then serve the web interface and handle chat requests. The application will typically run on `http://0.0.0.0:80`.

## Limitations
- The application does not support multiple clients simultaneously (due to hardware limitations).
- No user authentication is supported, and no user data is stored.
- File uploads and downloads are not supported.
- Code execution within the chat is not supported.
- Image/video/audio/other media or file generation is not supported.
- It can't make you coffee.

## Testing
Since this is a local chat application, testing primarily involves running the application and interacting with it.

1. **Launch the application** by double-clicking `PozzyAI.bat`.
2. **Open your web browser** and navigate to the address where the application is running (e.g., `http://localhost` or `http://127.0.0.1`).
3. **Send various messages** to PozzyAI, including:
    - General questions
    - Requests for code snippets (e.g., "Write a Python function to reverse a string.")
    - Long messages to test character count and input resizing.
    - Test the "Clear Chat" button.
    - Verify the "PozzyAI is thinking..." indicator.
4. **Check the console** for any errors (both browser console and the terminal running `app.py`).

This manual testing will help ensure the application is functioning as expected.
