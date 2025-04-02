import os
import requests
from pathlib import Path
import zipfile
import sys
import shutil

def download_file(url, filename):
    """Download a file from URL to the specified filename."""
    print(f"Downloading {filename}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    block_size = 8192
    
    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=block_size):
            if chunk:
                f.write(chunk)
    
    print(f"Downloaded {filename}")

def setup_tts():
    """Set up Piper TTS by downloading and extracting required files."""
    # Create directories
    piper_dir = Path('piper')
    output_dir = Path('output')
    piper_dir.mkdir(exist_ok=True)
    output_dir.mkdir(exist_ok=True)
    
    # Download URLs
    piper_url = "https://github.com/rhasspy/piper/releases/download/v1.3.0/piper_windows_x64.zip"
    model_url = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx"
    config_url = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx.json"
    
    try:
        # Download files
        download_file(piper_url, "piper.zip")
        download_file(model_url, "piper/en_US-hfc_female-medium.onnx")
        download_file(config_url, "piper/en_en_US_hfc_female_medium_en_US-hfc_female-medium.onnx.json")
        
        # Extract Piper executable
        print("Extracting Piper...")
        with zipfile.ZipFile("piper.zip", 'r') as zip_ref:
            # Create a temporary directory for extraction
            temp_dir = Path("temp_piper")
            temp_dir.mkdir(exist_ok=True)
            
            # Extract to temporary directory
            zip_ref.extractall(temp_dir)
            
            # Move piper.exe to the correct location
            piper_exe = next(temp_dir.glob("**/piper.exe"))
            shutil.copy2(piper_exe, piper_dir / "piper.exe")
            
            # Clean up temporary directory
            shutil.rmtree(temp_dir)
        
        # Clean up zip file
        os.remove("piper.zip")
        
        # Verify files exist
        required_files = [
            piper_dir / "piper.exe",
            piper_dir / "en_US-hfc_female-medium.onnx",
            piper_dir / "en_en_US_hfc_female_medium_en_US-hfc_female-medium.onnx.json"
        ]
        
        missing_files = [f for f in required_files if not f.exists()]
        if missing_files:
            print("Warning: Some files are missing:")
            for f in missing_files:
                print(f"  - {f}")
            sys.exit(1)
            
        print("\nTTS setup complete! You can now run the application.")
        print(f"Files are located in: {piper_dir.absolute()}")
        
    except Exception as e:
        print(f"Error during setup: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    setup_tts() 