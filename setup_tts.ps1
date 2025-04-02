# Create output directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "output"

# Download Piper TTS
$piperUrl = "https://github.com/rhasspy/piper/releases/download/v1.3.0/piper_tts-1.3.0-windows-x64.zip"
$modelUrl = "https://huggingface.co/rhasspy/piper-tts/resolve/main/en_US-hfc_female-medium.onnx"
$modelConfigUrl = "https://huggingface.co/rhasspy/piper-tts/resolve/main/en_en_US_hfc_female_medium_en_US-hfc_female-medium.onnx.json"

Write-Host "Downloading Piper TTS..."
Invoke-WebRequest -Uri $piperUrl -OutFile "piper.zip"
Invoke-WebRequest -Uri $modelUrl -OutFile "piper/en_US-hfc_female-medium.onnx"
Invoke-WebRequest -Uri $modelConfigUrl -OutFile "piper/en_en_US_hfc_female_medium_en_US-hfc_female-medium.onnx.json"

Write-Host "Extracting Piper TTS..."
Expand-Archive -Path "piper.zip" -DestinationPath "piper" -Force

Write-Host "Cleaning up..."
Remove-Item "piper.zip"

Write-Host "TTS setup complete! You can now run the application." 